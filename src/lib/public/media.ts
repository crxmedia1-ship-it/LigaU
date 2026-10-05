function withTransform(url: string | null | undefined, transform: string) {
  if (!url) return null;
  const marker = "/upload/";
  const index = url.indexOf(marker);
  if (index === -1) return url;
  return `${url.slice(0, index + marker.length)}${transform}/${url.slice(index + marker.length)}`;
}

export function cloudinaryThumb(url: string | null | undefined, width = 160) {
  return withTransform(url, `f_auto,q_auto,c_fit,w_${width},h_${width}`);
}

/** Modern format, tuned quality and no wider than `width`; non-Cloudinary URLs pass through. */
export function cloudinaryImage(url: string | null | undefined, width: number) {
  return withTransform(url, `f_auto,q_auto,c_limit,w_${width}`);
}
