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

## Admin Account Credentials (Web Panel)
Default Password: `admin123`

### Kotama Admins
| No | Kotama Name | Username | Role |
|---|---|---|---|
| 1 | KODAM I/BB | admin_ktm01 | Admin Kotama |
| 2 | KODAM II/SWJ | admin_ktm02 | Admin Kotama |
| 3 | KODAM III/SLW | admin_ktm03 | Admin Kotama |
| 4 | KODAM IV/DIP | admin_ktm04 | Admin Kotama |
| 5 | KODAM V/BRW | admin_ktm05 | Admin Kotama |
| 6 | KODAM VI/MLW | admin_ktm06 | Admin Kotama |
| 7 | KODAM XVIII/KSR | admin_ktm08 | Admin Kotama |
| 8 | KODAM IX/UDY | admin_ktm09 | Admin Kotama |
| 9 | KODAM IM | admin_ktm10 | Admin Kotama |
| 10 | KODAM XII/TPR | admin_ktm12 | Admin Kotama |
| 11 | KODAM XIII/MDK | admin_ktm13 | Admin Kotama |
| 12 | KODAM XIV/HSN | admin_ktm14 | Admin Kotama |
| 13 | KODAM JAYA | admin_ktm15 | Admin Kotama |
| 14 | KODAM XV/PTM | admin_ktm16 | Admin Kotama |
| 15 | KODAM XVII/CEN | admin_ktm17 | Admin Kotama |
| 16 | KOPASSUS | admin_ktm18 | Admin Kotama |
| 17 | KOSTRAD | admin_ktm19 | Admin Kotama |
| 18 | KODIKLATAD | admin_ktm20 | Admin Kotama |
| 19 | PUSZIAD | admin_ktm21 | Admin Kotama |
| 20 | PUSBEKANGAD | admin_ktm22 | Admin Kotama |
| 21 | PUSPALAD | admin_ktm23 | Admin Kotama |
| 22 | PUSKOMLEKAD | admin_ktm24 | Admin Kotama |
| 23 | PUSKESAD | admin_ktm25 | Admin Kotama |
| 24 | DITAJENAD | admin_ktm26 | Admin Kotama |
| 25 | DITTOPAD | admin_ktm27 | Admin Kotama |
| 26 | DITKUAD | admin_ktm28 | Admin Kotama |
| 27 | DITKUMAD | admin_ktm29 | Admin Kotama |
| 28 | RSPAD GATOT SOEBROTO | admin_ktm30 | Admin Kotama |
| 29 | KODAM XIX/TT | admin_ktm31 | Admin Kotama |
| 30 | DISPENAD | admin_ktm41 | Admin Kotama |
| 31 | DISBINTALAD | admin_ktm42 | Admin Kotama |
| 32 | DISJASAD | admin_ktm43 | Admin Kotama |
| 33 | DISKPSAD | admin_ktm44 | Admin Kotama |
| 34 | DISLITBANGAD | admin_ktm45 | Admin Kotama |
| 35 | DISINFOLAHTAD | admin_ktm46 | Admin Kotama |
| 36 | DISJARAHAD | admin_ktm47 | Admin Kotama |
| 37 | DISLAIKAD | admin_ktm48 | Admin Kotama |
| 38 | DISADAAD | admin_ktm49 | Admin Kotama |
| 39 | DISMINPERSAD | admin_ktm50 | Admin Kotama |
| 40 | PUSSENIF | admin_ktm61 | Admin Kotama |
| 41 | PUSSENKAV | admin_ktm62 | Admin Kotama |
| 42 | PUSSENARMED | admin_ktm63 | Admin Kotama |
| 43 | PUSSENARHANUD | admin_ktm64 | Admin Kotama |
| 44 | PUSPOMAD | admin_ktm65 | Admin Kotama |
| 45 | PUSTERAD | admin_ktm66 | Admin Kotama |
| 46 | PUSPENERBAD | admin_ktm67 | Admin Kotama |
| 47 | PUSINTELAD | admin_ktm68 | Admin Kotama |
| 48 | PUSSIBERAD | admin_ktm69 | Admin Kotama |
| 49 | AKMIL | admin_ktm71 | Admin Kotama |
| 50 | SESKOAD | admin_ktm72 | Admin Kotama |
| 51 | SECAPAAD | admin_ktm73 | Admin Kotama |
| 52 | DENMABESAD | admin_ktm81 | Admin Kotama |
| 53 | ITJENAD | admin_ktm82 | Admin Kotama |
| 54 | KODIKLAT TNI AD | admin_ktm94 | Admin Kotama |


### Kesatuan Admins (Sample List)
| No | Kesatuan Name | Username | Role |
|---|---|---|---|
| 1 | YONIF 100 /PRAJURIT SETIA | admin_smkl1A0B | Admin Satuan |
| 2 | BRIGIF 7 /RIMBA RAYA | admin_smkl1A1A | Admin Satuan |
| 3 | YONIF 122 /TOMBAK SAKTI | admin_smkl1A1B | Admin Satuan |
| 4 | KODIM 0201 /MEDAN | admin_smkl2Z0B | Admin Satuan |
| 5 | INFOLAHTADAM I /BB | admin_smkl4T0B | Admin Satuan |
| 6 | PUSDIKIF PUSSENIF | admin_smkl4A0X | Admin Satuan |
| 7 | DISINFOLAHTAD | admin_smkl4T0B | Admin Satuan |
| ... | ... | ... | ... |

*Note: There are over 300 Satuan admin accounts created. Use the pattern `admin_smkl[CODE]` to log in.*

