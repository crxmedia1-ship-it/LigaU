export function cloudinaryThumb(url: string | null | undefined, width = 160) {
  if (!url) return null;
  const marker = "/upload/";
  const index = url.indexOf(marker);
  if (index === -1) return url;
  return `${url.slice(0, index + marker.length)}f_auto,q_auto,c_fit,w_${width},h_${width}/${url.slice(index + marker.length)}`;
}
