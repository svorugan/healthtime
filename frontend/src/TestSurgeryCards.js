import React from 'react';

const TestSurgeryCards = () => {
  const surgeries = [
    {
      id: '1',
      name: 'Knee Replacement',
      description: 'Complete or partial knee joint replacement surgery for arthritis and joint pain',
      base_cost: 180000,
      duration: '2-3 hours',
      recovery: '6-8 weeks',
      rating: 4.8,
      procedures_done: 15420,
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop'
    },
    {
      id: '2',
      name: 'Hip Replacement',
      description: 'Hip joint replacement to restore mobility and reduce pain from arthritis',
      base_cost: 200000,
      duration: '1.5-2.5 hours',
      recovery: '8-10 weeks',
      rating: 4.9,
      procedures_done: 12890,
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=250&fit=crop'
    },
    {
      id: '3',
      name: 'Cataract Surgery',
      description: 'Remove clouded natural lens and replace with artificial intraocular lens',
      base_cost: 35000,
      duration: '20-30 minutes',
      recovery: '1-2 weeks',
      rating: 4.9,
      procedures_done: 28450,
      image: 'https://images.unsplash.com/photo-1582560469781-1965b9af5ebe?w=400&h=250&fit=crop'
    },
    {
      id: '4',
      name: 'Hernia Repair',
      description: 'Laparoscopic or open surgery to repair abdominal wall hernia',
      base_cost: 85000,
      duration: '1-2 hours',
      recovery: '2-4 weeks',
      rating: 4.7,
      procedures_done: 18920,
      image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=250&fit=crop'
    },
    {
      id: '5',
      name: 'Gallbladder Surgery',
      description: 'Minimally invasive laparoscopic cholecystectomy to remove gallbladder',
      base_cost: 95000,
      duration: '30-60 minutes',
      recovery: '1-2 weeks',
      rating: 4.8,
      procedures_done: 22340,
      image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&h=250&fit=crop'
    },
    {
      id: '6',
      name: 'Heart Bypass',
      description: 'Coronary artery bypass surgery to improve blood flow to the heart',
      base_cost: 450000,
      duration: '3-6 hours',
      recovery: '6-8 weeks',
      rating: 4.6,
      procedures_done: 5670,
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-4">
            🏥 Choose Your Surgery
          </h1>
          <p className="text-xl text-slate-600 mb-2">Select the procedure you're interested in</p>
          <p className="text-sm text-slate-500">Click on any card to see details and pricing</p>
        </div>

        <div className="text-center mb-4">
          <p className="text-gray-600">Surgeries count: {surgeries.length}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {surgeries.map((surgery) => (
            <div
              key={surgery.id}
              className="bg-white rounded-3xl shadow-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105"
            >
              {/* Image */}
              <div className="h-48 bg-gradient-to-br from-teal-400 to-blue-500 relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
                  <span className="text-yellow-500 mr-1">★</span>
                  <span className="font-semibold text-sm">{surgery.rating}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{surgery.name}</h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">{surgery.description}</p>
                
                {/* Stats Row */}
                <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <span className="mr-1">⏱️</span>
                    <span>{surgery.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">🏥</span>
                    <span>{surgery.procedures_done?.toLocaleString()} done</span>
                  </div>
                </div>

                {/* Recovery Time */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm">
                    <span className="text-gray-500">Recovery:</span>
                    <span className="ml-1 font-medium text-gray-700">{surgery.recovery}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-teal-600">
                        ₹{surgery.base_cost?.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">Starting from*</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestSurgeryCards;