"use client";

export default function TestImageProxyPage() {
  const testImageUrl = "https://images.unsplash.com/photo-1565299624942-b28ea40a0ca6?auto=format&fit=crop&w=800&q=80";
  const proxiedUrl = `/api/image-proxy?url=${encodeURIComponent(testImageUrl)}`;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Image Proxy Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Original Image URL</h2>
            <p className="text-sm text-gray-600 mb-4 break-all">{testImageUrl}</p>
            <img 
              src={testImageUrl} 
              alt="Original" 
              className="w-full h-64 object-cover rounded"
              onError={(e) => {
                console.error('❌ Original image failed to load');
                e.currentTarget.style.display = 'none';
              }}
              onLoad={() => console.log('✅ Original image loaded')}
            />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Proxied Image URL</h2>
            <p className="text-sm text-gray-600 mb-4 break-all">{proxiedUrl}</p>
            <img 
              src={proxiedUrl} 
              alt="Proxied" 
              className="w-full h-64 object-cover rounded"
              onError={(e) => {
                console.error('❌ Proxied image failed to load');
                e.currentTarget.style.display = 'none';
              }}
              onLoad={() => console.log('✅ Proxied image loaded')}
            />
          </div>
        </div>
        
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <p className="text-sm text-gray-600">
            Check the browser console for loading status. Both images should load successfully.
          </p>
        </div>
      </div>
    </div>
  );
} 