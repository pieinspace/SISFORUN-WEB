import { useState } from 'react';
import { Search, Download, ChevronDown } from 'lucide-react';

interface Pelari {
  id: number;
  pangkat: string;
  nama: string;
  email: string;
  kesatuan: string;
  subdis: string;
  totalSesi: number;
  totalJarak: number;
  statusTarget: string;
  bergabung: string;
}

const DataPelari = () => {
  const [searchNama, setSearchNama] = useState('');
  const [filterKesatuan, setFilterKesatuan] = useState('');
  const [filterSubdis, setFilterSubdis] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Data dummy untuk dropdown
  const kesatuanList = ['Kesatuan A', 'Kesatuan B', 'Kesatuan C', 'Kesatuan D'];
  const subdisList = ['Subdis 1', 'Subdis 2', 'Subdis 3', 'Subdis 4'];

  // Data pelari dummy
  const pelariData: Pelari[] = [
    {
      id: 1,
      pangkat: 'Lettu',
      nama: 'Ahmad Fauzi',
      email: 'ahmad.fauzi@mil.id',
      kesatuan: 'Kesatuan A',
      subdis: 'Subdis 1',
      totalSesi: 12,
      totalJarak: 48.5,
      statusTarget: 'Tercapai',
      bergabung: '2024-01-15'
    },
    {
      id: 2,
      pangkat: 'Kapten',
      nama: 'Budi Santoso',
      email: 'budi.santoso@mil.id',
      kesatuan: 'Kesatuan B',
      subdis: 'Subdis 2',
      totalSesi: 8,
      totalJarak: 32.0,
      statusTarget: 'Dalam Proses',
      bergabung: '2024-02-01'
    },
    {
      id: 3,
      pangkat: 'Mayor',
      nama: 'Candra Wijaya',
      email: 'candra.wijaya@mil.id',
      kesatuan: 'Kesatuan A',
      subdis: 'Subdis 1',
      totalSesi: 15,
      totalJarak: 60.2,
      statusTarget: 'Tercapai',
      bergabung: '2024-01-10'
    },
    {
      id: 4,
      pangkat: 'Sertu',
      nama: 'Dewi Lestari',
      email: 'dewi.lestari@mil.id',
      kesatuan: 'Kesatuan C',
      subdis: 'Subdis 3',
      totalSesi: 5,
      totalJarak: 20.0,
      statusTarget: 'Belum Mulai',
      bergabung: '2024-03-05'
    }
  ];

  // Filter data
  const filteredData = pelariData.filter(pelari => {
    const matchNama = pelari.nama.toLowerCase().includes(searchNama.toLowerCase());
    const matchKesatuan = !filterKesatuan || pelari.kesatuan === filterKesatuan;
    const matchSubdis = !filterSubdis || pelari.subdis === filterSubdis;
    const matchStatus = !filterStatus || pelari.statusTarget === filterStatus;
    return matchNama && matchKesatuan && matchSubdis && matchStatus;
  });

  const handleExport = () => {
    console.log('Exporting data...');
    alert('Fitur export akan segera tersedia');
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Data Pelari</h1>
          <p className="text-gray-500">Kelola dan pantau seluruh data pelari terdaftar</p>
        </div>

        {/* Filters - Single Row */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-12 gap-4">
            {/* Search Nama */}
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cari Nama
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama pelari..."
                  value={searchNama}
                  onChange={(e) => setSearchNama(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Kesatuan */}
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kesatuan
              </label>
              <div className="relative">
                <select
                  value={filterKesatuan}
                  onChange={(e) => setFilterKesatuan(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white cursor-pointer"
                >
                  <option value="">Semua Kesatuan</option>
                  {kesatuanList.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Filter Subdis */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subdis
              </label>
              <div className="relative">
                <select
                  value={filterSubdis}
                  onChange={(e) => setFilterSubdis(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white cursor-pointer"
                >
                  <option value="">Semua Subdis</option>
                  {subdisList.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Filter Status */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white cursor-pointer"
                >
                  <option value="">Semua Status</option>
                  <option value="Tercapai">Tercapai</option>
                  <option value="Dalam Proses">Dalam Proses</option>
                  <option value="Belum Mulai">Belum Mulai</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Export Button */}
            <div className="col-span-2 flex items-end">
              <button 
                onClick={handleExport}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pangkat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Sesi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Jarak
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bergabung
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.length > 0 ? (
                  filteredData.map((pelari) => (
                    <tr key={pelari.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {pelari.pangkat}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pelari.nama}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pelari.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pelari.totalSesi}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pelari.totalJarak} km
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          pelari.statusTarget === 'Tercapai' 
                            ? 'bg-green-100 text-green-800' 
                            : pelari.statusTarget === 'Dalam Proses'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {pelari.statusTarget}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pelari.bergabung}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-blue-600 hover:text-blue-800 font-medium">
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      Tidak ada data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Menampilkan {filteredData.length} dari {pelariData.length} pelari
              </p>
              <div className="flex space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition">
                  ‹
                </button>
                <button className="px-3 py-1 bg-green-600 text-white rounded">
                  1
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition">
                  2
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition">
                  3
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition">
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataPelari;