import { Log } from "./log";

export class TextureCache {
  private static cache: Map<string, WebGLTexture>
    = new Map<string, WebGLTexture>();

  static buildTexture(
    gl: WebGLRenderingContext,
    source: HTMLCanvasElement | HTMLImageElement) {
    let texture: WebGLTexture = gl.createTexture();
    TextureCache.bindTexture(gl, texture, source);
    return texture;
  }

  static bindTexture(gl: WebGLRenderingContext,
    texture: WebGLTexture,
    source: HTMLCanvasElement | HTMLImageElement) {

    // // Initially use solid magenta.
    // gl.bindTexture(gl.TEXTURE_2D, texture);
    // const level = 0;
    // const internalFormat = gl.RGBA;
    // const width = 1;
    // const height = 1;
    // const border = 0;
    // const srcFormat = gl.RGBA;
    // const srcType = gl.UNSIGNED_BYTE;
    // const pixel = new Uint8Array([255, 0, 255, 255]);
    // gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
    //   width, height, border, srcFormat, srcType,
    //   pixel);

    const level = 0;
    const internalFormat = gl.RGBA;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
      srcFormat, srcType, source);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER,
      gl.NEAREST);
  }

  static load(gl: WebGLRenderingContext, url: string) {
    if (TextureCache.cache.has(url)) {
      return TextureCache.cache.get(url);
    } else {
      let texture: WebGLTexture = gl.createTexture();

      // Initially use solid magenta.
      gl.bindTexture(gl.TEXTURE_2D, texture);
      const level = 0;
      const internalFormat = gl.RGBA;
      const width = 1;
      const height = 1;
      const border = 0;
      const srcFormat = gl.RGBA;
      const srcType = gl.UNSIGNED_BYTE;
      const pixel = new Uint8Array([255, 0, 255, 255]);
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        width, height, border, srcFormat, srcType,
        pixel);

      const image = new Image();
      image.onload = () => {
        this.bindTexture(gl, texture, image);
      };
      image.src = url;
      TextureCache.cache.set(url, texture);
      return texture;
    }
  }
}