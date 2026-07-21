# 切到 GitHub Actions 构建后需要自己声明依赖（原先走 GitHub Pages 默认构建，
# 用的是平台内置的 github-pages gem，锁在 Jekyll 3.x）。
# 这里锁到 Jekyll 4.4，与本地开发和验证时用的版本一致。
source "https://rubygems.org"

gem "jekyll", "~> 4.4"
gem "jekyll-seo-tag", "~> 2.9"
# sitemap.xml 现在是自己写的（要按发布日期过滤，插件做不到），
# 插件检测到源码里已有 sitemap.xml 就会让位，留着它只是兜底
gem "jekyll-sitemap", "~> 1.4"

# Windows 本地开发需要，CI 上装不装都行
gem "tzinfo-data", platforms: [:mingw, :x64_mingw, :mswin, :jruby]
