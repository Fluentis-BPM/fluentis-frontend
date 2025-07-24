import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export default function UserProfile() {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden ring-1 ring-gray-100">
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-2xl font-semibold text-gray-800">Perfil de usuario</h2>
      </div>
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <tbody>
              {[
                ['Nombre', user?.nombre],
                ['Email', user?.email],
                ['Rol', user?.rol],
                ['Departamento', user?.departamento],
                ['Cargo', user?.cargo],
              ].map(([label, value], idx) => (
                <tr
                  key={label}
                  className={
                    idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  }
                >
                  <td className="px-4 py-3 font-medium text-gray-600 uppercase text-xs tracking-wider">
                    {label}
                  </td>
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    {value || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
