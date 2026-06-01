import { useJsApiLoader } from '@react-google-maps/api';

const libraries = ['maps']; 

export const useGoogleMapsLoader = () => {
  return useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: libraries,
    id: 'google-map-script', // اجعل هذا الاسم ثابتاً في كل مكان تستخدم فيه هذا الـ Hook
  });
};