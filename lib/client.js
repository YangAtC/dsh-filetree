window.__ModuleLoader__.load({
	id: "@yangatc/dsh-filetree",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");

		//#region dsh-filetree client
		const CSS_ID = "dsh-filetree-css";
		const CHANNEL = "/filetree";

		function injectCss() {
			if (document.getElementById(CSS_ID)) return;
			const style = document.createElement("style");
			style.id = CSS_ID;
			style.textContent = `
.ft-sidebar{display:flex;flex-direction:column;height:100%;min-width:220px;background:color-mix(in srgb,var(--dsw-specific-sidebar-fill,#1e1e1e) 88%,transparent);color:var(--dsw-alias-label-primary,#d4d4d4);font-size:13px;overflow:hidden;backdrop-filter:blur(6px)}
.ft-sb-header{padding:10px 12px;border-bottom:1px solid var(--dsw-alias-border-l1,rgba(128,128,128,.25))}
.ft-sb-title{font-weight:600;font-size:13px;display:block;color:var(--dsw-alias-label-primary,#d4d4d4)}
.ft-sb-path{display:block;margin-top:4px;font-size:11px;color:var(--dsw-alias-label-secondary,rgba(212,212,212,.6));word-break:break-all}
.ft-body{flex:1;overflow:auto;padding:6px 0}
.ft-empty{padding:12px;color:var(--dsw-alias-label-secondary,rgba(212,212,212,.6))}
.ft-error{padding:12px;color:var(--dsw-alias-state-error-primary,#f48771)}
.ft-row{display:flex;align-items:center;white-space:nowrap;padding:2px 8px 2px 0;cursor:default;border-radius:4px;color:var(--dsw-alias-label-primary,#d4d4d4)}
.ft-row:hover{background:color-mix(in srgb,var(--dsw-alias-label-primary,#d4d4d4) 12%,transparent)}
.ft-caret{width:14px;flex:none;opacity:.7;color:var(--dsw-alias-label-secondary,rgba(212,212,212,.7))}
.ft-icon{margin-right:4px}
.ft-dir{font-weight:500}
.ft-file{color:var(--dsw-alias-label-secondary,rgba(212,212,212,.85))}
.ft-preview{position:relative;height:100%;display:flex;flex-direction:column;background:var(--dsw-alias-bg-base,#1e1e1e);color:var(--dsw-alias-label-primary,#d4d4d4)}
.ft2-barWrap{flex:none;position:sticky;top:0;z-index:3}
.ft2-bar{display:flex;align-items:center;gap:4px;padding:6px 12px;border-bottom:1px solid var(--dsw-alias-border-l1,rgba(128,128,128,.25));background:var(--dsw-alias-bg-layer-1,#252526);overflow-x:auto}
.ft2-tab{flex:none;display:flex;align-items:center;gap:6px;padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12.5px;color:var(--dsw-alias-label-secondary,rgba(212,212,212,.75));border:1px solid transparent}
.ft2-tab:hover{background:color-mix(in srgb,var(--dsw-alias-label-primary,#d4d4d4) 10%,transparent)}
.ft2-tabActive{background:color-mix(in srgb,var(--dsw-alias-label-primary,#d4d4d4) 16%,transparent);color:var(--dsw-alias-label-primary,#d4d4d4)}
.ft2-tabIcon{flex:none}
.ft2-tabName{max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ft2-close{flex:none;background:none;border:none;color:var(--dsw-alias-label-secondary,rgba(212,212,212,.7));font-size:12px;cursor:pointer;padding:0 4px;border-radius:3px}
.ft2-close:hover{color:var(--dsw-alias-label-primary,#d4d4d4);background:color-mix(in srgb,var(--dsw-alias-label-primary,#d4d4d4) 15%,transparent)}
.ft-preview-body{flex:1 1 auto;min-height:0;overflow:auto;position:relative}
.ft2-content{padding:16px 20px}
.ft-preview-pre{margin:0;font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;font-size:12.5px;line-height:1.55;white-space:pre-wrap;word-break:break-word}
.ft-tok-comment{color:#6a9955;font-style:italic}
.ft-tok-string{color:#ce9178}
.ft-tok-number{color:#b5cea8}
.ft-tok-keyword{color:#569cd6}
.ft-tok-ident{color:var(--dsw-alias-label-primary,#d4d4d4)}
.ft-preview-img{max-width:100%;max-height:100%;object-fit:contain}
`;
			document.head.appendChild(style);
		}

		const FILE_ICONS = {
			js: "🟨", jsx: "🟨", mjs: "🟨", cjs: "🟨", ts: "🟦", tsx: "🟦",
			json: "🧾", md: "📝", txt: "📄", log: "📄",
			py: "🐍", rb: "💎", go: "🐹", rs: "🦀", java: "☕", kt: "🟣", swift: "🍎",
			c: "🔵", h: "🔵", cpp: "🔷", hpp: "🔷", cs: "🟩",
			html: "🌐", htm: "🌐", css: "🎨", scss: "🎨", sass: "🎨", less: "🎨",
			php: "🐘", sh: "🖥️", bash: "🖥️", zsh: "🖥️", bat: "🖥️", ps1: "🖥️",
			yml: "⚙️", yaml: "⚙️", toml: "⚙️", ini: "⚙️", cfg: "⚙️", conf: "⚙️", env: "⚙️",
			xml: "📦", svg: "🖼️", png: "🖼️", jpg: "🖼️", jpeg: "🖼️", gif: "🖼️", webp: "🖼️", bmp: "🖼️", ico: "🖼️", avif: "🖼️",
			pdf: "📕", doc: "📘", docx: "📘", xls: "📗", xlsx: "📗", ppt: "📙", pptx: "📙",
			zip: "🗜️", tar: "🗜️", gz: "🗜️", "7z": "🗜️", rar: "🗜️",
			sql: "🗄️", db: "🗄️", sqlite: "🗄️",
			csv: "📊", tsv: "📊",
			lock: "🔒", gitignore: "🚫", dockerfile: "🐳", makefile: "🔨",
			vue: "🟩", svelte: "🔥", angular: "🔄", wasm: "🧩"
		};
		function fileIcon(name) {
			const ext = (name.split(".").pop() || "").toLowerCase();
			const base = name.toLowerCase();
			if (base === "dockerfile") return FILE_ICONS.dockerfile;
			if (base === "makefile") return FILE_ICONS.makefile;
			if (base === ".gitignore") return FILE_ICONS.gitignore;
			return FILE_ICONS[ext] || "📄";
		}
		function langOf(name) {
			const ext = (name.split(".").pop() || "").toLowerCase();
			const map = { js: "js", jsx: "js", mjs: "js", cjs: "js", ts: "ts", tsx: "ts", py: "py", rb: "rb", go: "go", rs: "rs", java: "java", c: "c", h: "c", cpp: "cpp", hpp: "cpp", cs: "cs", php: "php", sh: "sh", bash: "sh", zsh: "sh", bat: "sh", ps1: "sh", sql: "sql", json: "json", yml: "yaml", yaml: "yaml", toml: "yaml", ini: "yaml", cfg: "yaml", conf: "yaml", env: "yaml", css: "css", scss: "css", sass: "css", less: "css", html: "html", htm: "html", xml: "html", vue: "js", svelte: "js", md: "md" };
			return map[ext] || "";
		}
		const KEYWORDS = {
			js: "const let var function return if else for while do switch case break continue new class extends super this typeof instanceof in of async await try catch finally throw import export default null undefined true false yield static get set void delete",
			ts: "const let var function return if else for while do switch case break continue new class extends super this typeof instanceof in of async await try catch finally throw import export default null undefined true false yield static get set interface type enum namespace declare readonly private public protected implements void delete",
			py: "def return if elif else for while in not and or is None True False import from as class try except finally raise with lambda pass global nonlocal yield assert del",
			java: "public private protected class interface extends implements static final void int long double float boolean char byte short new return if else for while do switch case break continue try catch finally throw throws this super import package null true false abstract",
			c: "int char float double void return if else for while do switch case break continue struct union enum typedef static extern const signed unsigned long short new delete class public private protected namespace using template typename virtual override",
			cpp: "int char float double void return if else for while do switch case break continue struct union enum typedef static extern const signed unsigned long short new delete class public private protected namespace using template typename virtual override auto",
			cs: "public private protected class interface struct enum static readonly const void int long double float bool char string new return if else for foreach while do switch case break continue try catch finally throw this base namespace using null true false abstract virtual override",
			go: "package import func return if else for range switch case break continue defer go chan map struct interface type var const true false nil select default fallthrough",
			rs: "fn let mut return if else for while loop match break continue struct enum impl trait use mod pub crate self super true false None Some Ok Err as move ref static const unsafe async await",
			rb: "def end return if elsif else unless while until for in do case when begin rescue ensure class module require include extend attr_reader attr_writer true false nil self new yield",
			php: "echo print if else elseif foreach for while do switch case break continue function return class extends implements public private protected static new true false null require include namespace use",
			sh: "if then else fi for while do done case esac function return echo exit set unset export local read",
			sql: "select from where insert into values update set delete create table alter drop index join inner left right on group by order having limit and or not null primary key foreign references distinct as union",
			css: "important inherit initial unset",
			yaml: "true false null yes no on off",
			json: "true false null"
		};
		function highlight(code, lang) {
			const kw = (KEYWORDS[lang] || "").split(" ").filter(Boolean);
			const kwSet = {};
			for (const k of kw) kwSet[k] = true;
			const tokens = [];
			const re = /(\/\*[\s\S]*?\*\/|\/\/[^\n]*|#[^\n]*|<!--[\s\S]*?-->)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b(?:0x[0-9a-fA-F]+|\d+(?:\.\d+)?)\b)|([A-Za-z_$][\w$]*)/g;
			let last = 0, m;
			while ((m = re.exec(code))) {
				if (m.index > last) tokens.push({ t: "plain", v: code.slice(last, m.index) });
				if (m[1]) tokens.push({ t: "comment", v: m[1] });
				else if (m[2]) tokens.push({ t: "string", v: m[2] });
				else if (m[3]) tokens.push({ t: "number", v: m[3] });
				else if (m[4]) tokens.push({ t: kwSet[m[4]] ? "keyword" : "ident", v: m[4] });
				last = m.index + m[0].length;
			}
			if (last < code.length) tokens.push({ t: "plain", v: code.slice(last) });
			const out = [];
			for (let i = 0; i < tokens.length; i++) {
				const tok = tokens[i];
				if (tok.t === "plain") out.push(tok.v);
				else out.push(react.createElement("span", { key: i, className: "ft-tok-" + tok.t }, tok.v));
			}
			return out;
		}

		// ---- plugin-level preview state (survives view switches) ----
		let fileTabs = [];
		let fileSeq = 0;
		let activeFileId = null;
		const fileListeners = new Set();
		function notifyFile() { for (const fn of fileListeners) fn(); }
		function getFileTab(id) { for (const t of fileTabs) if (t.id === id) return t; return null; }
		function getFileTabByPath(path) { for (const t of fileTabs) if (t.path === path) return t; return null; }
		function useFileTabs() {
			const [, force] = react.useState(0);
			react.useEffect(() => { const fn = () => force((n) => n + 1); fileListeners.add(fn); return () => fileListeners.delete(fn); }, []);
			return { tabs: fileTabs, activeId: activeFileId };
		}
		function clickShippedTab(name) {
			try {
				if (typeof document === "undefined") return false;
				const tabEls = document.querySelectorAll('[role="tab"]');
				for (let i = 0; i < tabEls.length; i++) {
					const b = tabEls[i];
					if ((b.textContent || "").trim() === name) { b.click(); return true; }
				}
			} catch (e) {}
			return false;
		}
		function autoSwitchToPreview(attempts) {
			if (clickShippedTab("文件预览")) return;
			if (attempts <= 0) return;
			setTimeout(() => autoSwitchToPreview(attempts - 1), 100);
		}
		function openFilePreview(path, connection) {
			if (!path) return;
			const existing = getFileTabByPath(path);
			if (existing) {
				activeFileId = existing.id;
				notifyFile();
				autoSwitchToPreview(15);
				return;
			}
			const name = path.split(/[\\/]/).pop() || path;
			const id = "file-" + (++fileSeq);
			fileTabs.push({ id, path, name, loading: true });
			activeFileId = id;
			notifyFile();
			connection.rpc.call(CHANNEL, "read", { path }).then((res) => {
				const t = getFileTab(id);
				if (!t) return;
				if (res && res.error) { t.loading = false; t.error = res.error; }
				else { t.loading = false; t.data = res; }
				notifyFile();
			}).catch((e) => {
				const t = getFileTab(id);
				if (!t) return;
				t.loading = false; t.error = String(e && e.message ? e.message : e);
				notifyFile();
			});
			autoSwitchToPreview(15);
		}
		function closeFileTab(id) {
			const idx = fileTabs.findIndex((t) => t.id === id);
			if (idx === -1) return;
			fileTabs.splice(idx, 1);
			if (activeFileId === id) {
				activeFileId = fileTabs.length ? fileTabs[Math.max(0, idx - 1)].id : null;
			}
			notifyFile();
		}

		function PreviewPanel(props) {
			const { tabs: ftabs, activeId } = useFileTabs();
			const active = getFileTab(activeId);
			const bodyRef = react.useRef(null);
			react.useEffect(() => {
				if (bodyRef.current && active && !active.loading) bodyRef.current.scrollTop = 0;
			}, [activeId, active && active.loading]);
			let content;
			if (!active) {
				content = react.createElement("div", { className: "ft-empty" }, "双击文件树中的文件以预览");
			} else if (active.loading) {
				content = react.createElement("div", { className: "ft-empty" }, "加载中…");
			} else if (active.error) {
				content = react.createElement("div", { className: "ft-error" }, String(active.error));
			} else if (active.data && active.data.type === "image") {
				content = react.createElement("img", { className: "ft-preview-img", src: "data:" + active.data.mime + ";base64," + active.data.base64, alt: active.name });
			} else if (active.data && active.data.tooLarge) {
				content = react.createElement("div", { className: "ft-empty" }, "文件过大，无法预览");
			} else {
				const lang = langOf(active.name || "");
				const text = active.data && active.data.text != null ? active.data.text : "";
				const highlighted = lang ? highlight(text, lang) : text;
				content = react.createElement("pre", { className: "ft-preview-pre" }, highlighted);
			}
			const bar = ftabs.length
				? react.createElement("div", { className: "ft2-bar" }, ftabs.map((t) =>
					react.createElement("div", {
						key: t.id,
						className: t.id === activeId ? "ft2-tab ft2-tabActive" : "ft2-tab",
						onClick: () => { activeFileId = t.id; notifyFile(); }
					},
						react.createElement("span", { className: "ft2-tabIcon" }, fileIcon(t.name)),
						react.createElement("span", { className: "ft2-tabName" }, t.name),
						react.createElement("button", { className: "ft2-close", onClick: (e) => { e.stopPropagation(); closeFileTab(t.id); } }, "✕")
					)
				))
				: null;
			return react.createElement("div", { className: "ft-preview" },
				react.createElement("div", { className: "ft2-barWrap" }, bar),
				react.createElement("div", { className: "ft-preview-body", ref: bodyRef },
					react.createElement("div", { className: "ft2-content" }, content)
				)
			);
		}

		function TreeNode(props) {
			const node = props.node;
			const depth = props.depth;
			const onPreview = props.onPreview;
			const [open, setOpen] = react.useState(depth < 2);
			const isDir = node.type === "directory";
			const children = node.children || [];
			const icon = isDir ? "📁" : fileIcon(node.name);
			const row = react.createElement("div", {
				className: "ft-row",
				style: { paddingLeft: (depth * 14 + 8) + "px" },
				onClick: isDir ? () => setOpen(!open) : undefined,
				onDoubleClick: isDir ? undefined : () => onPreview(node.path)
			},
				react.createElement("span", { className: "ft-caret" }, isDir ? (open ? "▾" : "▸") : ""),
				react.createElement("span", { className: "ft-icon" }, icon),
				react.createElement("span", { className: isDir ? "ft-dir" : "ft-file" }, node.name)
			);
			const childEls = [];
			if (isDir && open) {
				for (const c of children) {
					childEls.push(react.createElement(TreeNode, { key: c.name + ":" + depth, node: c, depth: depth + 1, onPreview: onPreview }));
				}
			}
			return react.createElement("div", { className: "ft-node" }, row, childEls);
		}

		function FileTreeSidebar(props) {
			const useSessions = props.useSessions;
			const sessionId = props.sessionId;
			const cwd = useSessions ? useSessions((list) => list.byId[sessionId]?.cwd) : undefined;
			const [tree, setTree] = react.useState(null);
			const [status, setStatus] = react.useState("idle");
			const [error, setError] = react.useState(null);
			react.useEffect(() => {
				if (!cwd) { setTree(null); setStatus("idle"); return; }
				let cancelled = false;
				setStatus("loading");
				props.connection.rpc.call(CHANNEL, "list", { path: cwd }).then((res) => {
					if (cancelled) return;
					if (res && res.error) { setError(res.error); setStatus("error"); }
					else { setTree(res && res.tree ? res.tree : null); setStatus("ok"); }
				}).catch((e) => {
					if (cancelled) return;
					setError(String(e && e.message ? e.message : e)); setStatus("error");
				});
				return () => { cancelled = true; };
			}, [cwd]);
			const header = react.createElement("div", { className: "ft-sb-header" },
				react.createElement("span", { className: "ft-sb-title" }, "文件树"),
				cwd ? react.createElement("span", { className: "ft-sb-path" }, cwd) : null
			);
			let body;
			if (!cwd) {
				body = react.createElement("div", { className: "ft-empty" }, "无当前会话工作区");
			} else if (status === "loading") {
				body = react.createElement("div", { className: "ft-empty" }, "加载中…");
			} else if (status === "error") {
				body = react.createElement("div", { className: "ft-error" }, String(error));
			} else if (tree) {
				const children = tree.children || [];
				body = children.length
					? children.map((c) => react.createElement(TreeNode, { key: c.name, node: c, depth: 0, onPreview: (p) => openFilePreview(p, props.connection) }))
					: react.createElement("div", { className: "ft-empty" }, "空目录");
			} else {
				body = react.createElement("div", { className: "ft-empty" }, "空目录");
			}
			return react.createElement("div", { className: "ft-sidebar" },
				header,
				react.createElement("div", { className: "ft-body" }, body)
			);
		}

		const inject = ["slots", "connection", "layout"];
		function apply(ctx) {
			injectCss();
			const connection = ctx.connection;
			const layout = ctx.get("layout");
			if (layout) { try { layout.openDetails(); } catch (e) {} }

			// Right-sidebar file tree. `details` is a single slot already occupied
			// by ui-conversation's tool-details panel at priority 0; register at
			// priority 1 so the lowest-priority entry (ours) shadows it.
			ctx.effect(() => ctx.slots.inject("details", () => ctx.slots.register({
				name: "details",
				id: "dsh-filetree-sidebar",
				priority: 1,
				inject: () => ({ connection: connection, open: () => { try { layout.openDetails(); } catch (e) {} } })
			}, FileTreeSidebar)), "dsh-filetree: details");

			// Main-window "文件预览" tab. `conversation.view` is a list slot, so
			// registering with a unique id + label auto-adds the header tab.
			ctx.effect(() => ctx.slots.inject("conversation.view", () => ctx.slots.register({
				name: "conversation.view",
				id: "dsh-filetree-preview",
				order: 20,
				label: () => "文件预览",
				inject: () => ({ connection: connection })
			}, PreviewPanel)), "dsh-filetree: conversation.view");
		}

		exports.inject = inject;
		exports.apply = apply;
		return module.exports;
	}
});
