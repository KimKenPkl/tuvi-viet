import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

const GOC = 'https://kimkenpkl.github.io';

const DUONG_DAN = [
  '',
  'phuong-dong',
  'phuong-dong/can-luong',
  'phuong-dong/sao-han',
  'phuong-dong/phong-thuy',
  'phuong-dong/phi-tinh',
  'phuong-dong/la-ban',
  'phuong-dong/kinh-dich',
  'phuong-dong/tuong-so',
  'phuong-dong/lich-can-chi',
  'phuong-dong/so-dien-thoai',
  'phuong-dong/van-han-tuoi',
];

/**
 * GitHub Pages không trả index.html cho đường dẫn con, nên sinh thêm:
 *  - 404.html: chuyển hướng về /?p=<đường-dẫn>, router phục hồi URL đẹp
 *  - sitemap.xml, robots.txt: để công cụ tìm kiếm thấy các trang công cụ
 * Tất cả tính theo base của lần build (dev là '/', Pages là '/tuvi-viet/').
 */
function trangSeo(base: string): Plugin {
  const gocBase = base.endsWith('/') ? base : `${base}/`;
  const khongSlash = gocBase.replace(/\/+$/, '') || '';
  const homNay = new Date().toISOString().slice(0, 10);

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${DUONG_DAN.map(
  (d) => `  <url>
    <loc>${GOC}${gocBase}${d}</loc>
    <lastmod>${homNay}</lastmod>
    <changefreq>${d === '' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${d === '' ? '1.0' : d === 'phuong-dong' ? '0.9' : '0.7'}</priority>
  </url>`,
).join('\n')}
</urlset>
`;

  const robots = `User-agent: *
Allow: /

Sitemap: ${GOC}${gocBase}sitemap.xml
`;

  const trang404 = `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex" />
    <title>Đang chuyển trang…</title>
    <script>
      (function () {
        var base = ${JSON.stringify(khongSlash)};
        var p = window.location.pathname;
        if (base && p.indexOf(base) === 0) p = p.slice(base.length);
        p = p.replace(/\\/+$/, '') || '/';
        var q = window.location.search ? '&' + window.location.search.slice(1) : '';
        window.location.replace(base + '/?p=' + encodeURIComponent(p) + q + window.location.hash);
      })();
    </script>
  </head>
  <body>
    <p>Đang chuyển trang… <a href="${gocBase}">Bấm vào đây nếu trình duyệt không tự chuyển</a>.</p>
  </body>
</html>
`;

  return {
    name: 'tuvi-seo-pages',
    apply: 'build',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: '404.html', source: trang404 });
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots });
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap });
    },
  };
}

// VITE_BASE cho phép deploy lên GitHub Pages dạng /ten-repo/
// Ví dụ: VITE_BASE=/tuvi-viet/ npm run build
const base = process.env.VITE_BASE || '/';

export default defineConfig({
  base,
  plugins: [react(), trangSeo(base)],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
