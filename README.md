# KeyBatteryFinder.com

Find the exact battery for your car key fob by Make, Model and Year.

## 🚀 Setup

### 1. Create GitHub Repository
1. Go to github.com and create a new repo named `keybatteryfinder`
2. Upload all files from this folder to the repo

### 2. Deploy on Cloudflare Pages
1. Go to pages.cloudflare.com
2. Connect your GitHub account
3. Select the `keybatteryfinder` repo
4. Set build settings:
   - **Build command**: (leave empty)
   - **Build output directory**: `docs`
5. Click Deploy

### 3. Connect Your Domain
1. In Cloudflare Pages → Custom Domains
2. Add `keybatteryfinder.com`
3. Done!

### 4. Set Up Amazon Affiliate Links
1. Sign up at affiliate-program.amazon.com
2. Get your affiliate tag (e.g. `keybatteryfinder-20`)
3. Open `data/products.json`
4. Replace `keybatteryfinder-20` with your actual tag

### 5. Connect YouTube Videos
- The site currently links to your YouTube channel homepage
- To link specific videos per fob type, edit the video section in product pages

## 📁 Structure
```
docs/               ← Website root (served by Cloudflare)
  index.html        ← Homepage with search
  404.html          ← Not found page
  assets/
    css/style.css   ← All styles
    js/app.js       ← Search logic
  fob/              ← 9,673 product pages
    *.html
data/
  vehicle_index.json  ← Make/Model/Year → SKU lookup
  products.json       ← All product data
```

## 📊 Stats
- **9,673** product pages
- **220+** car makes
- **1,392** car models
- 100% static — zero server costs
