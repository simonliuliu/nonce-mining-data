// middleware.js
import { NextResponse } from "next/server";

const LOCALES = ["en", "zh"];
const DEFAULT_LOCALE = "en";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // 跳过所有静态资源和 API 路由
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // 文件请求（.js .css .png 等）
  ) {
    return NextResponse.next();
  }

  // 已经有合法 locale 前缀 → 直接通过，不做任何重定向
  const firstSegment = pathname.split("/")[1] || "";
  if (LOCALES.includes(firstSegment)) {
    return NextResponse.next();
  }

  // 没有 locale 前缀 → 检测浏览器语言，重定向到对应语言版本
  const acceptLang = request.headers.get("accept-language") || "";
  const preferredLang = acceptLang.split(",")[0]?.trim()?.slice(0, 2)?.toLowerCase();
  const locale = LOCALES.includes(preferredLang) ? preferredLang : DEFAULT_LOCALE;

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  return NextResponse.redirect(url, { status: 307 }); // 307 临时重定向
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - 包含扩展名的文件请求 (favicon.ico, logo.jpg 等)
     */
    "/((?!_next/static|_next/image|.*\\..*$).*)",
  ],
};
