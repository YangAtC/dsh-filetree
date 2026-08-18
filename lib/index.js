/**
 * @yangatc/dsh-filetree — Host half.
 *
 * Durable profile plugin (real Node process) for DeepSeek Harness.
 * Provides the file-tree RPC channel the browser Client half calls over
 * `ctx.connection.rpc.call('/filetree', 'list'|'read', payload)`.
 *
 * Endpoints:
 *   list  { path }  -> { root, tree }
 *   read  { path }  -> { type:'text', name, text }
 *                     | { type:'image', name, mime, base64 }
 *                     | { type:'text', name, tooLarge:true }
 *                     | { error }
 */

import { readdir, stat, readFile } from 'node:fs/promises'
import { resolve, basename, extname, sep } from 'node:path'

export const inject = ['connection']

/** Private RPC channel name shared with the Client half. */
const CHANNEL = '/filetree'

/** Directories that are skipped entirely when building the tree. */
const IGNORED = new Set([
  'node_modules', '.git', 'dist', 'build', '.DS_Store', '.next', 'coverage',
  '.cache', 'out', 'target', '.venv', 'venv', '__pycache__', '.idea',
  '.vscode', '.turbo', '.yarn'
])

const IMAGE_EXTS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'svg', 'avif'])
const MIME = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
  webp: 'image/webp', bmp: 'image/bmp', ico: 'image/x-icon', svg: 'image/svg+xml',
  avif: 'image/avif'
}

/** Maximum depth of the tree before truncating with a placeholder node. */
const MAX_DEPTH = 6
/** Files larger than this are reported as too-large instead of reading text. */
const MAX_TEXT_BYTES = 300 * 1024
/** Image read cap (10 MiB) to avoid shipping huge base64 across the channel. */
const MAX_IMAGE_BYTES = 10 * 1024 * 1024

/** Normalize a display path to the platform's native separator. */
function winPath(p) {
  return String(p).split('/').join(sep)
}

/**
 * Recursively build the tree for a directory.
 * @returns {{name:string,type:'directory',path:string,children:Array}|null}
 */
async function buildTree(root, depth) {
  if (depth > MAX_DEPTH) {
    return { name: '\u2026', type: 'directory', path: root, children: [] }
  }
  let entries
  try {
    entries = await readdir(root, { withFileTypes: true })
  } catch {
    return null
  }
  const children = []
  for (const e of entries) {
    if (IGNORED.has(e.name)) continue
    const full = winPath(resolve(root, e.name))
    if (e.isDirectory()) {
      const sub = await buildTree(full, depth + 1)
      children.push({ name: e.name, type: 'directory', path: full, children: sub ? sub.children : [] })
    } else if (e.isFile()) {
      children.push({ name: e.name, type: 'file', path: full })
    }
  }
  return { name: '', type: 'directory', path: root, children }
}

function bytesToBase64(bytes) {
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  let result = ''
  let i = 0
  for (; i + 3 <= bytes.length; i += 3) {
    const b0 = bytes[i], b1 = bytes[i + 1], b2 = bytes[i + 2]
    result += CHARS[b0 >> 2]
    result += CHARS[((b0 & 3) << 4) | (b1 >> 4)]
    result += CHARS[((b1 & 15) << 2) | (b2 >> 6)]
    result += CHARS[b2 & 63]
  }
  const rem = bytes.length - i
  if (rem === 1) {
    const b0 = bytes[i]
    result += CHARS[b0 >> 2]
    result += CHARS[(b0 & 3) << 4]
    result += '=='
  } else if (rem === 2) {
    const b0 = bytes[i], b1 = bytes[i + 1]
    result += CHARS[b0 >> 2]
    result += CHARS[((b0 & 3) << 4) | (b1 >> 4)]
    result += CHARS[(b1 & 15) << 2]
    result += '='
  }
  return result
}

async function handleRead(path) {
  if (!path) return { ok: false, error: { code: 'no-path', message: 'no-path', details: {} } }
  const target = winPath(resolve(path))
  let info
  try { info = await stat(target) } catch { return { ok: false, error: { code: 'not-found', message: 'not-found', details: {} } } }
  if (!info.isFile()) return { ok: false, error: { code: 'not-found', message: 'not-found', details: {} } }
  const name = basename(target)
  const ext = extname(name).toLowerCase().replace('.', '')
  if (IMAGE_EXTS.has(ext)) {
    const bytes = await readFile(target)
    if (bytes.length > MAX_IMAGE_BYTES) {
      return { ok: true, value: { type: 'image', name, mime: MIME[ext] || 'image/png', tooLarge: true } }
    }
    return { ok: true, value: { type: 'image', name, mime: MIME[ext] || 'image/png', base64: bytesToBase64(bytes) } }
  }
  if (info.size !== undefined && info.size > MAX_TEXT_BYTES) {
    return { ok: true, value: { type: 'text', name, tooLarge: true } }
  }
  const text = await readFile(target, 'utf8')
  return { ok: true, value: { type: 'text', name, text } }
}

/** Register the file-tree RPC channel. */
export function apply(ctx) {
  const connection = ctx.connection
  const dispose = connection.rpc.handle(CHANNEL, async (endpoint, payload, signal) => {
    try {
      if (endpoint === 'list') {
        const root = payload && typeof payload.path === 'string' ? payload.path : ''
        if (!root) return { ok: false, error: { code: 'no-path', message: 'no-path', details: {} } }
        const tree = await buildTree(winPath(resolve(root)), 0)
        return { ok: true, value: { root, tree } }
      }
      if (endpoint === 'read') {
        return await handleRead(payload && typeof payload.path === 'string' ? payload.path : '')
      }
      return { ok: false, error: { code: 'unknown', message: `unknown endpoint ${endpoint}`, details: {} } }
    } catch (error) {
      return { ok: false, error: { code: 'internal', message: error instanceof Error ? error.message : String(error), details: {} } }
    }
  }, { authority: 'loopback' })
  ctx.effect(() => () => {
    void dispose()
  }, 'dsh-filetree: rpc channel')
}
