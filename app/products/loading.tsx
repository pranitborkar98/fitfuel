import AppChrome from "@/app/_web/AppChrome";
import s from "./products.module.css";

export default function ProductsLoading() {
  return (
    <AppChrome notice="Browse on FitFuel, then buy and receive order support from Nutrabay.">
      <div className={s.page} aria-busy="true">
        <header className={s.hero}>
          <div className={s.wrap}>
            <h1>Shop supplements</h1>
            <p className={s.lede} role="status">Loading the product catalogue…</p>
          </div>
        </header>
      </div>
    </AppChrome>
  );
}
