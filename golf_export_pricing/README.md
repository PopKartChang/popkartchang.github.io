# eBay 海外商品定価・利益シミュレーター（公開フロントエンド）

このフォルダだけを GitHub Pages の公開リポジトリに置きます。計算式は含まれておらず、非公開の計算 API から結果を受け取ります。

## 公開前の設定

1. 先に `private-core` を Cloudflare Workers にデプロイします。
2. `config.js` の `apiUrl` に Worker の URL を入力します。
3. Turnstile を使う場合は、公開用サイトキーを `turnstileSiteKey` に入力します。秘密鍵はここに書きません。
4. このフォルダの中身を `https://popkartchang.github.io/golf_export_pricing/` に公開します。

設定例：

```js
window.EBAY_PRICING_CONFIG = {
  apiUrl: "https://ebay-pricing-core.popkart-ebay-pricing.workers.dev",
  turnstileSiteKey: ""
};
```

利用者が入力した設定、箱、商品種類、計算履歴はブラウザの `localStorage` に保存されます。サーバー側には保存しません。設定画面から JSON の書き出し・読み込みができます。

## 公開してよいもの

- `index.html`
- `style.css`
- `app.js`
- `config.js`
- `.nojekyll`

`private-core`、`engine.js`、`legacy-engine.js` は公開リポジトリに入れないでください。
