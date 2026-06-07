# Issue Frontend: Terapkan Diskon/Potongan Harga pada Sales

Repository frontend: https://github.com/AFisFisabilillah/frontend-toko-komputer.git

## Latar Belakang

Backend sales sudah diperbarui agar mendukung potongan harga pada transaksi penjualan. Frontend perlu menyesuaikan form, tabel, detail invoice, import, export/download, dan dashboard agar data diskon dapat diinput, dikirim ke API, ditampilkan, dan dihitung dengan benar.

Frontend saat ini masih menghitung total sales dari `price * qty` tanpa diskon. Hal ini terlihat pada halaman create/edit sale, detail sale, invoice print/download, import preview, dan dashboard recent sales.

## Kontrak Backend yang Harus Dipakai

### Payload Create/Update Sales

Endpoint:

- `POST /sales`
- `PATCH /sales/{id}`

Payload diskon transaksi:

```json
{
  "customer_name": "Budi",
  "payment_method": "cash",
  "discount_type": "nominal",
  "discount_value": 50000,
  "products": [
    {
      "product_id": 1,
      "qty": 2,
      "discount_type": "percent",
      "discount_value": 10
    }
  ]
}
```

Field diskon transaksi:

- `discount_type`: nullable, `nominal` atau `percent`
- `discount_value`: nullable/integer, nilai rupiah jika `nominal`, nilai 0-100 jika `percent`

Field diskon item produk:

- `products.*.discount_type`: nullable, `nominal` atau `percent`
- `products.*.discount_value`: nullable/integer, nilai rupiah jika `nominal`, nilai 0-100 jika `percent`

### Response Sales List dan Detail

Field baru dari backend:

- `subtotal_price`
- `discount_type`
- `discount_value`
- `discount_amount`
- `total_price`

Pada detail produk sales:

- `subtotal_before_discount`
- `discount_type`
- `discount_value`
- `discount_amount`
- `subtotal`

### Import Sales

Endpoint:

- `POST /sales/import`

Kolom file yang perlu didukung frontend:

- `customer_name`
- `payment_method`
- `subtotal_price`
- `discount_type`
- `discount_value`
- `discount_amount`
- `total_price`

Aturan:

- `payment_method`: `cash`, `transfer`, `qris`
- `discount_type`: kosong, `nominal`, atau `percent`
- Jika `discount_amount` kosong, backend menghitung dari `discount_type` dan `discount_value`
- Jika `total_price` kosong, backend menghitung dari `subtotal_price - discount_amount`

## File Frontend Terdampak

- `src/pages/CreateSale.jsx`
- `src/pages/EditSale.jsx`
- `src/pages/SalesPage.jsx`
- `src/pages/SaleDetail.jsx`
- `src/pages/ImportSale.jsx`
- `src/pages/HomePage.jsx`
- `src/assets/data.json` jika fallback dashboard masih dipakai
- Opsional: buat helper baru seperti `src/utils/saleCalculations.js` atau `src/utils/formatCurrency.js`

## Scope Pekerjaan

### 1. Create Sale

File: `src/pages/CreateSale.jsx`

Tambahkan input diskon transaksi pada form:

- Select `discount_type` dengan pilihan:
  - `nominal`
  - `percent`
- InputNumber `discount_value`
- Validasi:
  - Jika `discount_value > 0`, `discount_type` wajib dipilih
  - Jika `discount_type = percent`, nilai maksimal `100`
  - Diskon tidak boleh lebih besar dari subtotal

Tambahkan diskon per item pada tabel produk yang dipilih:

- Kolom `Discount Type`
- Kolom `Discount Value`
- Kolom `Discount Amount`
- Kolom subtotal akhir item

Update kalkulasi order summary:

- Tampilkan `Subtotal`
- Tampilkan `Item Discount` jika ada
- Tampilkan `Transaction Discount`
- Tampilkan `Total Amount` sebagai total akhir setelah diskon

Update payload submit agar mengirim:

- `discount_type`
- `discount_value`
- `products[].discount_type`
- `products[].discount_value`

### 2. Edit Sale

File: `src/pages/EditSale.jsx`

Saat mengambil detail sales dari `GET /sales/{id}`:

- Isi form dengan `sale.discount_type` dan `sale.discount_value`
- Map produk dengan field:
  - `discount_type`
  - `discount_value`
  - `discount_amount`
  - `subtotal_before_discount`
  - `subtotal`

Update summary:

- `Previous Total` tetap tampil, tetapi gunakan total akhir lama `sale.total_price`
- `New Subtotal`
- `New Discount`
- `New Total`
- `Difference` dihitung dari `newTotal - sale.total_price`

Update payload `PATCH /sales/{id}` sama seperti create sale.

### 3. Sales List

File: `src/pages/SalesPage.jsx`

Update tabel sales:

- Tambahkan kolom `Subtotal`
- Tambahkan kolom `Discount`
- Kolom `Total` tetap menampilkan `total_price`
- Jika `discount_amount > 0`, tampilkan tag/teks diskon:
  - `Rp 50.000`
  - atau `10%`

Update filter:

- Filter `min_total` dan `max_total` tetap menggunakan total akhir (`total_price`) karena backend memakai field itu.

Update export:

- Tombol export tetap memanggil `GET /sales/export`
- Pastikan file hasil export dari backend yang sudah memiliki kolom diskon tetap bisa diunduh tanpa perubahan format lokal.

### 4. Sale Detail, Invoice, Print, dan Download

File: `src/pages/SaleDetail.jsx`

Update tampilan detail:

- Di `Transaction Summary`, tampilkan:
  - `Subtotal`: `sale.subtotal_price`
  - `Discount`: `sale.discount_amount`
  - `Total`: `sale.total_price`

Update tabel produk:

- Harga
- Qty
- Subtotal sebelum diskon
- Diskon item
- Subtotal akhir item

Jangan lagi menghitung subtotal dari `record.price * record.qty` jika backend sudah mengirim `record.subtotal` dan `record.subtotal_before_discount`.

Update invoice print:

- Tambahkan kolom diskon item
- Tambahkan ringkasan subtotal, diskon transaksi, dan total akhir

Update download:

- `downloadExcel()`
- `downloadText()`
- `downloadPDF()` melalui template invoice

Semua output harus memuat informasi diskon agar invoice cocok dengan data backend.

### 5. Import Sales

File: `src/pages/ImportSale.jsx`

Update validasi dan preview import.

Kolom yang perlu dibaca:

- `customer_name`
- `payment_method`
- `subtotal_price`
- `discount_type`
- `discount_value`
- `discount_amount`
- `total_price`

Update `requiredFields`:

- `payment_method` wajib
- `subtotal_price` atau `total_price` minimal harus ada salah satu
- `customer_name` tetap opsional

Validasi tambahan:

- `payment_method` hanya `cash`, `transfer`, `qris`
- `discount_type` hanya kosong, `nominal`, atau `percent`
- Jika `discount_type = percent`, `discount_value <= 100`
- Jika `discount_amount` ada, tidak boleh lebih besar dari `subtotal_price`
- Jika `total_price` kosong, frontend preview menghitung `subtotal_price - discount_amount`

Update preview table:

- Customer
- Payment
- Subtotal
- Discount
- Total

Update modal detail preview agar menampilkan field diskon.

Update informasi file requirement. Saat ini teks masih menyebut `products (JSON array of products)`, padahal backend import sales saat ini mengimpor header sales dengan field subtotal/diskon/total. Teks requirement perlu disesuaikan dengan format backend.

### 6. Dashboard

File: `src/pages/HomePage.jsx`

Backend dashboard sekarang menyediakan field tambahan pada `salesStats`:

- `grossRevenue`
- `totalDiscount`
- `netRevenue`

Update sales stat cards:

- `Gross Sales`
- `Total Discount`
- `Net Sales`
- `Avg Sale Value`

Update recent sales table:

- Tambahkan `subtotal`
- Tambahkan `discount`
- `amount` tetap total akhir

Update recent activities:

- Jika activity sale punya `discount`, tampilkan diskon jika lebih dari 0

Update fallback data:

- `src/assets/data.json` perlu ditambah field `grossRevenue`, `totalDiscount`, `netRevenue`, dan `discount` di recent sales agar dashboard tetap aman saat API gagal.

### 7. Helper Kalkulasi

Disarankan membuat helper agar rumus tidak dobel di `CreateSale.jsx` dan `EditSale.jsx`.

File opsional:

- `src/utils/saleCalculations.js`

Fungsi yang disarankan:

```js
export function calculateDiscountAmount(type, value, subtotal) {
  if (!type || !value) return 0;
  if (type === 'percent') return Math.round((subtotal * value) / 100);
  return value;
}

export function calculateSaleTotals(products, discountType, discountValue) {
  const subtotal = products.reduce((sum, product) => {
    const beforeDiscount = product.price * product.qty;
    const itemDiscount = calculateDiscountAmount(
      product.discount_type,
      product.discount_value,
      beforeDiscount
    );
    return sum + Math.max(beforeDiscount - itemDiscount, 0);
  }, 0);

  const discountAmount = calculateDiscountAmount(discountType, discountValue, subtotal);
  const total = Math.max(subtotal - discountAmount, 0);

  return { subtotal, discountAmount, total };
}
```

## UX Detail yang Diharapkan

- Gunakan Ant Design `Select` untuk tipe diskon.
- Gunakan Ant Design `InputNumber` untuk nilai diskon.
- Prefix rupiah untuk diskon nominal.
- Suffix `%` untuk diskon persen.
- Disable submit jika diskon tidak valid.
- Tampilkan error yang jelas saat backend mengembalikan validasi, misalnya diskon lebih besar dari subtotal.
- Jangan membuat tampilan marketing/landing; ini perubahan dashboard/admin operasional.

## Acceptance Criteria

- User dapat membuat sales dengan diskon nominal transaksi.
- User dapat membuat sales dengan diskon persen transaksi.
- User dapat membuat sales dengan diskon per item.
- User dapat edit sales lama dan nilai diskon lama tetap terisi di form.
- Order summary menghitung subtotal, diskon, dan total akhir secara real time.
- Payload create/update mengirim field diskon sesuai kontrak backend.
- Sales list menampilkan subtotal, diskon, dan total akhir.
- Detail sale menampilkan diskon transaksi dan diskon per item.
- Print invoice menampilkan subtotal, diskon, dan total akhir.
- Download invoice Excel/Text/PDF menampilkan subtotal, diskon, dan total akhir.
- Import sales preview mengenali kolom diskon.
- Import sales menolak data diskon tidak valid sebelum upload.
- Dashboard menampilkan gross sales, total discount, dan net sales.
- Frontend tetap kompatibel dengan data lama yang tidak punya diskon dengan fallback nilai `0`.

## Catatan Implementasi

- Anggap `total_price` dari backend adalah total akhir setelah diskon.
- Jangan menghitung ulang total dari `price * qty` pada halaman detail jika backend sudah memberi `subtotal`.
- Gunakan fallback:
  - `subtotal_price ?? total_price`
  - `discount_amount ?? 0`
  - `product.subtotal_before_discount ?? product.price * product.qty`
  - `product.subtotal ?? product.price * product.qty`
- Pastikan format rupiah konsisten dengan `toLocaleString('id-ID')` atau helper currency yang sudah ada.
- Jalankan `npm run lint` dan `npm run build` setelah implementasi.
