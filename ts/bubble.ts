import * as GLM from "gl-matrix"  // npm install -D gl-matrix
import { Geometry } from "./geometry";
import { Shape } from "./shape";
import { ThingState } from "./thingState";

export class Bubble extends Shape {
  private canvas: HTMLCanvasElement;

  constructor(gl: WebGLRenderingContext, text: string, state: ThingState) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.clearRect(0, 0, 512, 256);
    ctx.beginPath();
    ctx.fillRect(0, 0, 512, 256);
    ctx.beginPath();
    ctx.fillStyle = "green";
    ctx.font = "128px 'Courier New', Courier, monospace";
    ctx.fillText(text, 0, 128, 512);
    super(gl, canvas, state);
    this.canvas = canvas;

    const positions: number[] = [];
    const normals: number[] = [];
    const textureCoords: number[] = [];
    Geometry.addRectangleData(positions, normals, textureCoords, 1.5, 0.75);


    this.createBuffers(gl, positions, textureCoords, normals);
  }

  getObjectTransform() {
    const objectTransform = super.getObjectTransform();
    GLM.mat4.translate(objectTransform, objectTransform, [0, 3.5, 0]);
    return objectTransform;
  }

  private makeMessageSVG(message: string) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.innerHTML = message;
    text.setAttribute("x", "50");
    text.setAttribute("y", "50");
    text.setAttribute("font-size", "30");
    svg.appendChild(text);

    const xml = new XMLSerializer().serializeToString(svg);
    const data = btoa(xml);
    const dataUrl = `data:image/svg+xml;base64,${data}`;
    const img = document.createElement('img');
    img.src = dataUrl;
    return img;
  }

}