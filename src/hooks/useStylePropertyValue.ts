/**
 * Hook for getting the value of a CSS property from the computed styles of the document's root element.
 * Returns undefined if the code is executed on the server.
 *
 * @param property - The name of the CSS property to get the value for
 * @returns The value of the specified CSS property or undefined during server rendering
 */
export function useStylePropertyValue(property: string) {
  if (typeof window === "undefined") {
    return undefined;
  }

  const styles = getComputedStyle(document.documentElement);
  return styles.getPropertyValue(property);
}
