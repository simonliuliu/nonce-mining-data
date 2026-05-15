// lib/notion-retry.js
// Notion API 稳定性增强：自动重试 + 请求内去重
//
// withRetry — 自动重试可恢复的失败（限流、5xx、网络抖动）
// dedupe    — 同一次页面渲染内、对同一函数同一参数的多次调用只发一次请求

const { cache } = require("react");

// ─── 重试策略 ─────────────────────────────────────────────────
// 指数退避：第 1 次失败后 250ms，再失败 700ms，再失败 2000ms，再失败放弃
const RETRY_DELAYS = [250, 700, 2000];

// 哪些错误值得重试（404/unauthorized/参数错误这种确定性失败不重试）
function isRetryable(err) {
  if (!err) return false;
  const code   = err.code || "";
  const status = err.status || 0;
  const msg    = err.message || "";

  return (
    code === "rate_limited" ||
    code === "internal_server_error" ||
    code === "service_unavailable" ||
    code === "gateway_timeout" ||
    status === 429 ||
    status >= 500 ||
    msg.includes("fetch failed") ||
    msg.includes("ETIMEDOUT") ||
    msg.includes("ECONNRESET") ||
    msg.includes("ENOTFOUND") ||
    msg.includes("socket hang up") ||
    msg.includes("network")
  );
}

/**
 * withRetry — 自动重试 Notion API 调用
 *
 * @param {Function} fn    — async 函数，会被调用 1~4 次
 * @param {string}   label — 日志里显示的标签，方便排查
 * @returns {Promise<any>}
 *
 * 示例：
 *   const r = await withRetry(() => notion.databases.query({...}), "getQuarterlyData");
 */
async function withRetry(fn, label = "notion") {
  let lastErr;
  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;

      if (!isRetryable(err) || attempt === RETRY_DELAYS.length) {
        // 不可重试错误，或已用完重试次数
        break;
      }

      const delay = RETRY_DELAYS[attempt];
      console.warn(
        `[notion-retry] ${label} attempt ${attempt + 1}/${RETRY_DELAYS.length + 1} failed: ` +
        `${err.code || err.message}. Retrying in ${delay}ms...`
      );
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

/**
 * dedupe — React cache() 包装器
 * 在同一次 Server Component 渲染内，对同一函数+同一参数的多次调用只发一次请求
 *
 * @param {Function} fn — 任意 async 函数
 * @returns {Function}
 */
const dedupe = cache;

module.exports = { withRetry, dedupe, isRetryable };
