import useSWR from 'swr';

const uploadForDashboard = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/dashboard`, {
    method: 'POST',
    body: formData,
  });
  
  return response.json();
};

export function useDashboard(file?: File) {
  const shouldFetch = Boolean(file);
  
  return useSWR(
    shouldFetch ? ['dashboard', file.name] : null,
    () => uploadForDashboard(file!),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
}
