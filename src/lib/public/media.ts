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

/** Logo trimmed to its mark and capped at `height` px tall. */
export function cloudinaryLogo(url: string | null | undefined, height = 160) {
  return withTransform(url, `e_trim,f_auto,q_auto,c_fit,h_${height}`);
}

/** Player photo with the background removed by Cloudinary AI and trimmed to the figure, `height` px tall. */
export function cloudinaryCutout(url: string | null | undefined, height: number) {
  if (!url?.includes("res.cloudinary.com")) return null;
  return withTransform(url, `e_background_removal/e_trim/f_auto,q_auto,c_fit,h_${height}`);
}

/** Modern format, tuned quality and no wider than `width`; non-Cloudinary URLs pass through. */
export function cloudinaryImage(url: string | null | undefined, width: number) {
  return withTransform(url, `f_auto,q_auto,c_limit,w_${width}`);
}
