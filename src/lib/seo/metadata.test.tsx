import { renderToStaticMarkup } from "react-dom/server";
import manifest from "../../app/manifest";
import robots from "../../app/robots";
import { JsonLd } from "../../components/json-ld";
import { absoluteUrl, siteName } from "../site";

describe("SEO metadata", () => {
  it("publishes an installable Indonesian marketplace manifest", () => {
    const value = manifest();

    expect(value.name).toContain(siteName);
    expect(value.lang).toBe("id");
    expect(value.display).toBe("standalone");
    expect(value.icons).toContainEqual(
      expect.objectContaining({
        src: "/assets/brand/seapedia-app-icon.png",
        sizes: "512x512",
        type: "image/png",
      }),
    );
  });

  it("keeps private and API routes out of the crawl surface", () => {
    const value = robots();
    const rules = Array.isArray(value.rules) ? value.rules[0] : value.rules;

    expect(value.sitemap).toBe(absoluteUrl("/sitemap.xml"));
    expect(rules.disallow).toEqual(
      expect.arrayContaining(["/api/", "/dashboard/", "/checkout"]),
    );
  });

  it("builds absolute URLs from the configured site origin", () => {
    expect(absoluteUrl("/products/prd-coral-tote")).toMatch(
      /^https?:\/\/[^/]+\/products\/prd-coral-tote$/,
    );
  });

  it("escapes markup-like content inside JSON-LD", () => {
    const html = renderToStaticMarkup(
      <JsonLd
        data={{
          "@context": "https://schema.org",
          name: "</script><script>alert(1)</script>",
        }}
      />,
    );

    expect(html).not.toContain("</script><script>");
    expect(html).toContain("\\u003c/script>");
  });
});
