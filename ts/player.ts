import * as GLM from "gl-matrix"  // npm install -D gl-matrix
import { Geometry } from "./geometry";
import { Shape } from "./shape";
import { ThingState } from "./thingState";

export class Player extends Shape {
  constructor(gl: WebGLRenderingContext, state: ThingState) {
    let imageSource = "img/Empty Player.png";
    if (state.imageSource) {
      imageSource = state.imageSource;
    }
    super(gl, imageSource, state);
    // Kili: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAgCAYAAACinX6EAAAC7klEQVRoQ+2ZPUhcQRDH96FgkcIU1wTOKjamSpMiYCEEtJBUQUx3RSCQJk3IRxETAhYq2FwTCFhcp4iVsfBAsAikSJMixCapcqCFYFJYCBHDPLLv9u2bnZndvXd3flz3dmdn5//befPmvUseT18/U8hv79dfNTYyiE3lxoYXl1kb0+DPy2fZpe9a10YxPhMXANhMAsEWUWvcVo3a11ys5hgVLLbWdOSa7ymAp7d2MsEQ4OjSrvrxYoIdwyDZa23x3LztE9ZzUKMzoP5xriDYlQELlWohi18dtrIxLlhsnvKJHYgNNQXQOjxV1cpAITjJLWBmAJeuHACvYvLfmPPJQY3OAKyQuchzwdoAuODBPtZnCkBy0q7TcVVy33TFxFP3vLb3AYAdTC4DbBAYGHtMA+jGaWFFjasB1BMJ/JEAJP0BAKCKjQ3GDNgsgJKKLbm1tE+uAGptXhmAZQSVAdIgtHhJyksyTYuT2JJF0M4ACoCrRkiC8Ak45ElBrSnlKdDpIMv055UBWCBv6kfp8MzDqY7Gub66nfnrtG/tGPaIzoALDUBypACgejNRd+9MSszFNp+/NFXr51kpvnUQsAeaAVRzU/9+Lyfiw9bv9LoMAHqjTvsuADCruxZvNxh7y5XsTc+GID7WPjTMtcIu8TpugACdlfn+3WtNMW18rhPkxGuhutMqC4JEkGkjsWf7AKn4bkCQCNI2ElsuQ5Pn31bSb4LYSwW1uKxMkIiiALxfWcvCfvJoltOvUgC+4lmvhMHE5INsFvvoKnkDtW8B7XC3uUGGhgFJTg+2s6/C4/fbX3g/bba/3oJXas4HCHcqvgDMvc3Tl8ZUAADtIbSeGADXnHQz084FIhRAiPj0KWBmwP5xu5u7ca2Z00XNhQCANRiEngIIFRKzzobgCyD05HXMuQyIERK6ti8BnLx9rYbezYdq8loXAiC28Jnr0QwAAPavLCDcUwHioHqDc38LuIqheQBXAIh/qi9FBlBFJRbAP0G6ZklojVmmAAAAAElFTkSuQmCC
    // Shin Whai: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAgCAYAAACinX6EAAACCElEQVRoQ+2ZvUrEQBDHN1gKVkGMrWgldna2epXlgZWg+AZa+Qz6BuKBlXClVbTUzu6wUmzNIalEy0PZg43J3CQ7k/1IOHJldmZ25jf/2c3dBYMw+RU1P9er6+Jx9F3TG3ebjGN0YWGlZ3UfFSyoAiALPP54K9147gHokHcAHIyAhA7HoEr+2MhwxmU6AsO1DdF/f51puG4EpMNRGumEkq1zklW2umI4MbFEjc4AlwCoVJ0CoCThSgGUvbFxkc90qsnHrlQAlgQci7kCQJl5EwCwY5xOVSkiPwbcmCwFYIA4CqDK2qcdCwCWWAeAcQ367Cx1L2MFnKeX1L1aadcBMPk2KFvKVUAiLkhKiMQZyc7UyFgBdQ5BXXEUSLoYZWDysWWMKQDsejt8GRVi3GxumcK25q+DPgiTwl7QXq6rZ6gCYPH5aG0CwbmWIRTlOwOgqnjp5BoApkb4bZXyxkqVWwGArvimAMBirAOgFA6TcKUESnEUG5YC2g4AFmwVwGQcZ78K7+z/v9U93Z0WIMI1nwrwCmB4G4v+QU9gAOCaCwhYd70BSH72sq5Hi/cFBZSt2YbQKADqwaHsbBcv43YAkD9jvIzA10MolnZTkgiUbVMKICVJNAryt4Dy+dw+Qd2Xn6+y5y6KL8vZ5rUH90AB6OD5LL7sXNDlSF3vAGAjQKHnWwWUnOrY/AGxPXBK267vRwAAAABJRU5ErkJggg==
    // Tsien Whai data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAgCAYAAACinX6EAAACOUlEQVRoQ+2Zv0vEMBzFU08UblIQvEEHRycHcRTBQQcRXOQGNwXByX9FJyfdRA7Hm85BEGcHJ0cHRU4Q3A4UayWFlqRN8n1p0vPoXcfm9Zvv++QlvR/B4dZUxBTX08sPW5wfVw1B905v75S6ieduev97oaGthep4AVR7vL6Wmy/QAeBKFwiuABJjJkiJGxQA12cheAegM55dqaR5xKApcqJ5tKYIwRsAk3HVSqHNUvutCAAxCTGA14+Qzc3UcnMhWwAxPogAEgjOCVi5eqMWKR3f793ntBf1Vfh5ldC1ZgwAWWldlzYJsDmxbajYHILZulICsiBUYLL3bAHYGOuH1ghA1cBQAUASUakEUJFTbYlKA0AOx0oDoBLBx0922uyyuYxIrTR7rYdUX0Z9XpzP4fw5oNIAkCUbAajqFjg7b+UCcHTQdPqKjCSq3xrlGaAynzQ2iBCQt5UObA6AyTwvwgGUeSFmkA9oaI8SAMq8mAJ0AludLQBEb+ohBoAaFwuVlQTEkKhB9KUAoFa2KCDkG6irabH3IOx20l+Fa43NdCzsdiSPpjETDFsQZQAwJTwHIIoiFgQBUwHQjflMg28A1PaWAIzNbqReft9vJF+mMQqAzeHpEwBlnvclAUCNuOioLeELAGL+XwBQafABADUvAfhq19nkdi/u73P3kU1fLykXWtSVkQQEgG5eG+NJDeUW4ACylw6ICwT+LLUluMb02itiWvsadDVT9HkKwgiA4Z/qoUiAKVmuAP4A91WsQByG6BwAAAAASUVORK5CYII=
    // Aksel: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAgCAYAAACinX6EAAABhElEQVRoQ+2ZMRaCMAyGiwMDk4sTA4NcwcGL6Bn1Ip6EycWJgUF9VcurhTQJAa1SF4H8hORrkvI0UUrdlOCzzDLW3as8b/XnqmqPL3X9OMb89ekgn5TAklAA6GAxCJD9pwBgqwIlicHB/EL2j1aAvVImILsNzDU3WV/yVJ8/BcBuBxM4NBv+FgBlJmjN1wGsi4Lcfos07WivTUO+v08o9SmeAbMHgO3b7qphW9aQXQDz6SsxcQVwAfiCwbY6zD6kl4IBQE2OqqPCCAIANymuftIW2JQlFXaQOnEFRACxAmbeAkE2NiMo8QxgPCtIaQQg/UUoyGVlBBUrwFTAYdvFtj89r/lsPthT+GQsLknaVoAOdvdKWN953CplA4BsGICxfZKyYoi6APZ6yQEAPTYSgBF9MnIjSWMFxBnw+mdIzwDd8+63GYKQDWuBsX2S6pohemsBM/TspN3jvnPoeQamsdvnPuCM+MVSEABlZbGnuwDG8Ik9k2uPL0LxVVj49zi35ELT3wGu7gAusR1XtwAAAABJRU5ErkJggg==
    // Monster: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAgCAYAAACinX6EAAACPUlEQVRoQ+2ZP0pDQRDGN2irKFjqAaxS2+gBrIOCWAkRD2Aj1oLkAKJgKSipPUBsrFN5AA+gBxAi+3Cek8nMZGc3+9hoXvXy/syb+c33zb4krcFwNHI/28PFOuy6t/cvt721XH+GnaOrj7Fje+3WxDXzdKAlAfBFcBAWAP6qArD8QcKSDfx5UILVAoNh7ThnvVeyVkrMygLX3VW3ubE0Ef/fAOC6L80AOgytXUzpVooC+v2+63Q6EyEqBVwer7ATX5vmTVtAKsDnGAJVBQAKoJLnLADHJABaov4c3biucOC5uLhwuEdSZBQALpGmAOCEARyFRQFodqTxIFZlgVAFYEXkVoCUMG4KAAiZQyKA7v7a77o05RXOAoDrmsUCVLKatUIsE6QAGihmGYQHSQljCFTSWtetQLTr8bn6VVhaCqetBCA/Wri1Y/45HAAJKBdfAqjBUAFoCgAwd8+f1a4GIBRGTgA+R1DczBTgg5YCgM4cswV8MTE2KAkAnilRAEDWMSDwrKBfmUv+fWDs9wCcKEDAxVjAzAsEEYDUNQsE/LW5VBWYAVhnRelKiAKQE8Lu6Y57uX1tTDDFAfCVNwkhGkCoCubKAoftc/c47Inyo+elgXhz/+TOTg6qOLEAvAr8ltsOogKgWA2KBwAFSjBiATRlhSQLUKlwEFIAAIScSigeQG4IIgCrB3NYACvMmk/oOsoCgIdBEG0QTXszTLUAhTDroZhsAa3zeEiGdqTp6xYA8L/DMfRzez8mJ8s93/iday8W3oKvAAAAAElFTkSuQmCC

    this.lightness = 1.0;
    this.radius = 0.6;

    const positions = []
    const vertexNormals = [];
    const textureCoordinates = [];

    Geometry.addCubeData(positions, textureCoordinates, vertexNormals,
      0.65, 0.65, 0.65);
    Geometry.translate(positions, 0, 1.3, 0);
    Geometry.addTubeData(positions, textureCoordinates, vertexNormals, 0.6);

    this.createBuffers(gl, positions, textureCoordinates, vertexNormals);
  }

  getObjectTransform() {
    const objectTransform = super.getObjectTransform();
    GLM.mat4.translate(objectTransform, objectTransform,
      [0, 2, 0]);
    return objectTransform;
  }
}