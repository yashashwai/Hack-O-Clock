import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Search, Filter, Calendar } from 'lucide-react';

const photos = [
    { id: 'TXN-1004-PRE', txn: 'TXN-1004', status: 'Pre-handover', src: 'https://images.unsplash.com/photo-1588872657578-75d1ebabfa7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MTY4Mjl8MHwxfHNlYXJjaHwyfHxsYXB0b3AlMjBjaGFyZ2VyfGVufDB8fHx8MTcwODY0MzYxNXww&ixlib=rb-4.0.3&q=80&w=400', time: '10:30 AM', date: 'Oct 24' },
    { id: 'TXN-1004-POST', txn: 'TXN-1004', status: 'Post-return', src: 'https://images.unsplash.com/photo-1588872657578-75d1ebabfa7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MTY4Mjl8MHwxfHNlYXJjaHwyfHxsYXB0b3AlMjBjaGFyZ2VyfGVufDB8fHx8MTcwODY0MzYxNXww&ixlib=rb-4.0.3&q=80&w=400', time: '12:45 PM', date: 'Oct 24' },
    { id: 'TXN-1005-PRE', txn: 'TXN-1005', status: 'Pre-handover', src: 'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MTY4Mjl8MHwxfHNlYXJjaHwxfHxjYW1lcmF8ZW58MHx8fHwxNzA4NjQzNjUzfDA&ixlib=rb-4.0.3&q=80&w=400', time: '09:15 AM', date: 'Oct 23' },
    { id: 'TXN-1002-POST', txn: 'TXN-1002', status: 'Disputed', src: 'https://images.unsplash.com/photo-1544377193-33dcf4d68e1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MTY4Mjl8MHwxfHNlYXJjaHwxNXx8YnJva2VuJTIwc2NyZWVufGVufDB8fHx8MTcwODY0Mzc1Nnww&ixlib=rb-4.0.3&q=80&w=400', time: '11:20 AM', date: 'Oct 22' },
];

export default function Gallery() {
    const [activeTab, setActiveTab] = useState('All');
    const [search, setSearch] = useState('');

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pre-handover': return 'bg-gray-200 text-gray-700';
            case 'Post-return': return 'bg-primary text-black';
            case 'Disputed': return 'bg-red-500 text-white';
            default: return 'bg-gray-200 text-dark';
        }
    };

    return (
        <div className="bg-surface min-h-[calc(100vh-72px)] flex flex-col font-sans">
            {/* Header */}
            <header className="px-6 py-4 bg-white shadow-sm z-10 sticky top-0">
                <h1 className="text-22pt font-bold text-dark leading-tight mb-4">Proof Gallery</h1>

                {/* Tabs */}
                <div className="flex gap-6 border-b border-gray-100">
                    {['All', 'Mine', 'Disputed'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === tab ? 'text-primary-dark' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-lg"></div>
                            )}
                        </button>
                    ))}
                </div>
            </header>

            <main className="flex-1 px-4 py-6 overflow-y-auto">
                {/* Search & Filter */}
                <section className="flex gap-2 mb-6">
                    <div className="relative flex-1 block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search TXN ID or User..."
                            className="w-full bg-white border border-gray-200 rounded-pill py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => toast('Date filters coming soon')}
                        className="w-12 h-12 flex-shrink-0 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 shadow-sm hover:bg-surface relative group transition-colors"
                    >
                        <Filter size={20} />
                    </button>
                </section>

                {/* Photo Grid */}
                <section className="grid grid-cols-2 gap-3">
                    {photos.map(photo => (
                        <div key={photo.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col cursor-pointer active:scale-[0.98] transition-transform">
                            {/* Image Container */}
                            <div className="relative aspect-square bg-gray-100">
                                <img
                                    src={photo.src}
                                    alt={`Proof for ${photo.txn}`}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />

                                {/* Status Overlay */}
                                <div className="absolute top-2 right-2">
                                    <span className={`px-2 py-0.5 rounded-pill text-[10px] font-bold shadow-sm ${getStatusColor(photo.status)}`}>
                                        {photo.status}
                                    </span>
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="p-3">
                                <h3 className="text-xs font-mono font-bold text-dark mb-1">{photo.txn}</h3>
                                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                    <Calendar size={10} />
                                    <span>{photo.date}, {photo.time}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>
            </main>
        </div>
    );
}
