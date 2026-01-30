# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```


No	Nama	NRP	Password	Role
1	Andi Pratama	111111	password123	militer
2	Budi Santoso	111112	password123	militer
3	Citra Dewi	222221	password123	asn
4	Diana Putri	222222	password123	asn
5	Fitri Rahmawati	888888	password123	asn
6	Eko Saputra	999999	password123	militer
User Militer Baru (10 user)
No	Nama	NRP	Password	Kesatuan	Pangkat
1	Hendra Wijaya	200101	password123	Kodam Jaya	Kolonel
2	Agus Setiawan	200102	password123	Kodam Siliwangi	Letnan Kolonel
3	Bambang Susilo	200103	password123	Kodam Iskandar Muda	Mayor
4	Rizky Pratama	200104	password123	Kodam Brawijaya	Kapten
5	Dedi Kurniawan	200105	password123	Kodam Diponegoro	Lettu
6	Fajar Nugroho	200106	password123	Kopassus	Letda
7	Gunawan Santoso	200107	password123	Kostrad	Serma
8	Irfan Hakim	200108	password123	Marinir	Serka
9	Joko Purnomo	200109	password123	Paskhas	Sertu
10	Krisna Murti	200110	password123	Zeni AD	Kopral
User ASN Baru (10 user)
No	Nama	NRP	Password	Kesatuan	Pangkat
1	Lestari Dewi	400101	password123	Mabes TNI AD	PNS Gol IV/a
2	Maya Sari	400102	password123	Puspen TNI	PNS Gol IV/b
3	Nur Hidayah	400103	password123	Kemhan RI	PNS Gol III/d
4	Oktavia Putri	400104	password123	Ditjen Strahan	PNS Gol III/c
5	Priyanti Wulan	400105	password123	Babek TNI	PNS Gol III/b
6	Qonita Rahma	400106	password123	Satsiber TNI	PNS Gol III/a
7	Ratna Kusuma	400107	password123	Puskom TNI	PNS Gol II/d
8	Sinta Maharani	400108	password123	Puskes TNI	PNS Gol II/c
9	Tika Permata	400109	password123	Rohmin TNI	PNS Gol II/b
10	Umi Kalsum	400110	password123	Pusinfolahta	PNS Gol II/a
