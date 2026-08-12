type MarkmapInstance = {
  fit: (maxScale?: number) => Promise<void>;
  destroy: () => void;
};

function getContainerSize(container: HTMLElement) {
  const rect = container.getBoundingClientRect();
  return {
    width: Math.max(rect.width || container.clientWidth, 320),
    height: Math.max(rect.height || container.clientHeight, 400),
  };
}

function applySvgSize(svg: SVGSVGElement, width: number, height: number) {
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
}

/**
 * Render a markmap into a container. Uses absolute SVG dimensions so
 * markmap-view/d3-zoom can read baseVal (avoids SVGLength relative-length errors).
 */
export async function renderMarkmapInContainer(
  container: HTMLDivElement,
  markdown: string
): Promise<{ destroy: () => void }> {
  const { Transformer } = await import("markmap-lib");
  const { Markmap } = await import("markmap-view");

  const transformer = new Transformer();
  const { root } = transformer.transform(markdown);

  container.innerHTML = "";

  const { width, height } = getContainerSize(container);
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  applySvgSize(svg, width, height);
  svg.style.display = "block";
  svg.style.width = "100%";
  svg.style.height = "100%";
  container.appendChild(svg);

  const mm = Markmap.create(svg, { autoFit: false }, root) as MarkmapInstance;

  const fit = () => {
    const size = getContainerSize(container);
    applySvgSize(svg, size.width, size.height);
    void mm.fit();
  };

  // Wait for layout before first fit (flex parents may report 0×0 initially)
  requestAnimationFrame(() => {
    requestAnimationFrame(fit);
  });

  const ro =
    typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => fit())
      : null;
  ro?.observe(container);

  return {
    destroy: () => {
      ro?.disconnect();
      mm.destroy();
    },
  };
}
