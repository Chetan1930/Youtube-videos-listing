const API_BASE = "https://api.freeapi.app/api/v1/public/youtube/videos";

const container = document.getElementById("video-container");
const statusEl = document.getElementById("status");
const metaLine = document.getElementById("meta-line");
const pager = document.getElementById("pager");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");
const pageLabel = document.getElementById("page-label");

let currentPage = 1;
let totalPages = 1;

function parseIsoDuration(iso) {
  if (!iso || typeof iso !== "string") return "";
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return iso;
  const h = m[1] ? Number(m[1]) : 0;
  const min = m[2] ? Number(m[2]) : 0;
  const s = m[3] ? Number(m[3]) : 0;
  const parts = [];
  if (h) parts.push(`${h}h`);
  if (min || h) parts.push(`${min}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
}

function formatViews(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "—";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}M views`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, "")}K views`;
  return `${num.toLocaleString()} views`;
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function normalizeRow(row) {
  const v = row && row.items ? row.items : row;
  if (!v || !v.id) return null;
  const sn = v.snippet || {};
  const thumbs = sn.thumbnails || {};
  const thumb =
    (thumbs.maxres && thumbs.maxres.url) ||
    (thumbs.standard && thumbs.standard.url) ||
    (thumbs.high && thumbs.high.url) ||
    (thumbs.medium && thumbs.medium.url) ||
    (thumbs.default && thumbs.default.url) ||
    "";
  const stats = v.statistics || {};
  const duration = v.contentDetails && v.contentDetails.duration ? parseIsoDuration(v.contentDetails.duration) : "";
  return {
    id: v.id,
    title: sn.title || "Untitled",
    channel: sn.channelTitle || "",
    publishedAt: sn.publishedAt,
    thumb,
    views: formatViews(stats.viewCount),
    duration,
  };
}

function setLoading(isLoading) {
  container.setAttribute("aria-busy", isLoading ? "true" : "false");
  if (isLoading) {
    container.innerHTML = Array.from({ length: 8 }, () => '<div class="skeleton-card" aria-hidden="true"></div>').join("");
  }
}

function setStatus(message, kind) {
  statusEl.textContent = message;
  statusEl.className = "status" + (kind ? ` status--${kind}` : "");
  statusEl.hidden = !message;
}

async function fetchPage(page) {
  const url = `${API_BASE}?page=${encodeURIComponent(String(page))}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json || json.statusCode !== 200 || !json.data) throw new Error("Unexpected response");
  return json.data;
}

function renderVideos(list) {
  const cards = list
    .map((row) => normalizeRow(row))
    .filter(Boolean)
    .map(
      (v) => `
    <article class="video-card">
      <a class="video-card__media" href="https://www.youtube.com/watch?v=${encodeURIComponent(v.id)}" target="_blank" rel="noopener noreferrer">
        <img class="video-card__thumb" src="${escapeAttr(v.thumb)}" alt="" loading="lazy" width="640" height="360">
        ${v.duration ? `<span class="video-card__duration">${escapeHtml(v.duration)}</span>` : ""}
      </a>
      <div class="video-card__body">
        <h2 class="video-card__title">
          <a href="https://www.youtube.com/watch?v=${encodeURIComponent(v.id)}" target="_blank" rel="noopener noreferrer">${escapeHtml(v.title)}</a>
        </h2>
        <p class="video-card__channel">${escapeHtml(v.channel)}</p>
        <p class="video-card__meta">${escapeHtml(v.views)} · ${escapeHtml(formatDate(v.publishedAt))}</p>
      </div>
    </article>`
    )
    .join("");
  container.innerHTML = cards || '<p class="empty">No videos on this page.</p>';
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/'/g, "&#39;");
}

function updatePager() {
  pager.hidden = totalPages <= 1;
  btnPrev.disabled = currentPage <= 1;
  btnNext.disabled = currentPage >= totalPages;
  pageLabel.textContent = `Page ${currentPage} of ${totalPages}`;
}

async function loadPage(page) {
  setStatus("", "");
  setLoading(true);
  btnPrev.disabled = true;
  btnNext.disabled = true;
  try {
    const data = await fetchPage(page);
    currentPage = data.page || page;
    totalPages = data.totalPages || 1;
    const rows = Array.isArray(data.data) ? data.data : [];
    renderVideos(rows);
    const total = data.totalItems != null ? data.totalItems : "—";
    metaLine.hidden = false;
    metaLine.textContent = `Showing ${rows.length} videos · ${total} total`;
    updatePager();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (e) {
    container.innerHTML = "";
    setStatus("Could not load videos. Check your connection and try again.", "error");
    metaLine.hidden = true;
    pager.hidden = true;
  }
}

btnPrev.addEventListener("click", () => {
  if (currentPage > 1) loadPage(currentPage - 1);
});

btnNext.addEventListener("click", () => {
  if (currentPage < totalPages) loadPage(currentPage + 1);
});

loadPage(1);
