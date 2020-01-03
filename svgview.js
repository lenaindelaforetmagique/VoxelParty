var SVGNS = "http://www.w3.org/2000/svg";

if (!Array.prototype.last) {
  Array.prototype.last = function() {
    return this[this.length - 1];
  };
};

colorGeneratorRGBA = function(r = 0, g = 0, b = 0, alpha = 1) {
  return `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${alpha})`;
}
colorGeneratorHSLA = function(h = 0, s = 0, l = 0, alpha = 1) {
  // return `hsl(${Math.floor(h)}, ${Math.floor(s)}, ${Math.floor(l)}, ${alpha})`;
  return `hsl(${h}, ${s}%, ${l}%, ${alpha})`;
}





class Universe {
  constructor() {
    this.container = document.getElementById("container");
    this.lb = document.getElementById("aleft");
    this.rb = document.getElementById("aright");
    this.ub = document.getElementById("aup");
    this.db = document.getElementById("adown");
    this.legend = document.getElementById("legend");

    this.dom = document.createElementNS(SVGNS, "svg");

    this.radius = 75;
    this.unit = 20;
    this.container.appendChild(this.dom);

    this.viewBox = new ViewBox(this.dom, this.radius);
    this.camera = new Camera(this);
    this.raytracing = new Raytracing(this);

    this.nodes = [];
    this.faces = [];
    this.base = 10;
    this.ii = -1;
    this.jj = 0;
    this.kk = 0;
    this.voxels = [];

    let header = document.getElementById("header");
    let footer = document.getElementById("footer");
    // console.log(this.viewBox.fact);
    this.viewBox.translate(-window.innerWidth / 2, -(footer.offsetTop + header.offsetTop + header.offsetHeight) / 2);


    this.init();
    this.addEvents();
  }

  init() {
    // clean everything
    while (this.dom.firstChild != null) {
      this.dom.removeChild(this.dom.firstChild);
    }

    this.nodesDom = document.createElementNS(SVGNS, 'g');
    this.facesDom = document.createElementNS(SVGNS, 'g');

    this.dom.appendChild(this.facesDom);
    this.dom.appendChild(this.nodesDom);

    this.nodes = [];
    this.faces = [];

    this.voxels = [];

    var legend = "";

    this.legend.innerText = legend;
  }

  appendVoxel() {
    this.ii += 1;
    if (this.ii == this.base) {
      this.jj += 1;
      this.ii = 0;
    }
    if (this.jj == this.base) {
      this.kk += 1;
      this.jj = 0;
    }

    // let x_ = (this.ii - this.base / 2) * this.unit;
    // let y_ = (this.jj - this.base / 2) * this.unit;
    // let z_ = (this.kk - this.base / 2) * this.unit;


    let x_ = Math.floor((Math.random() - 0.5) * this.base) * this.unit;
    let y_ = Math.floor((Math.random() - 0.5) * this.base) * this.unit;
    let z_ = Math.floor((Math.random() - 0.5) * this.base) * this.unit;



    let color = (x_ + y_ + z_) / (3 * 5 * this.unit) * 360;

    let newVoxel = new Voxel(this, x_, y_, z_, this.unit, color);
    for (let node of newVoxel.nodes) {
      this.nodes.push(node);
      this.nodesDom.appendChild(node.dom);
      node.show();
    }

    for (let face of newVoxel.faces) {
      this.faces.push(face);
    }

    this.voxels.push(newVoxel);

    this.updateFaces();
  }

  updateFaces() {
    this.faces.sort(EVAL_DISTANCE);
    while (this.facesDom.firstChild != null) {
      this.facesDom.removeChild(this.facesDom.firstChild);
    }
    for (let face of this.faces) {
      this.facesDom.appendChild(face.dom);
      face.show();
    }

  }

  update() {
    this.camera.update_vectors();
    for (let node of this.nodes) {
      node.show();
    }

    this.updateFaces();
  }

  addEvents() {
    let thiz = this;
    // KEYBOARD Events
    document.onkeydown = function(e) {
      // console.log(e.key);
      switch (e.key.toUpperCase()) {
        case " ":
          thiz.init();
          break;
        case "ENTER":
          thiz.appendVoxel();
          break;
          // case "ARROWLEFT":
          //   thiz.init();
          //   break;
          // case "ARROWRIGHT":
          //   thiz.init();
          //   break;
          // case "ARROWUP":
          //   thiz.init();
          //   break;
          // case "ARROWDOWN":
          //   thiz.init();
          //   break;
        case "PAGEUP":
          ALPHA = Math.min(1, ALPHA + 0.05);
          thiz.update();
          break;
        case "PAGEDOWN":
          ALPHA = Math.max(0, ALPHA - 0.05);
          thiz.update();
          break;
        default:
          // console.log(e);
          break;
      }
    }

    // MOUSE events
    this.container.addEventListener("mousedown", function(e) {
      e.preventDefault();
      if (e.ctrlKey) {
        // thiz.addNode(thiz.viewBox.realX(e.clientX), thiz.viewBox.realY(e.clientY));
      } else {
        // thiz.addPoint(thiz.viewBox.realX(e.clientX), thiz.viewBox.realY(e.clientY));
      }
    }, false);

    document.addEventListener("mousemove", function(e) {
      // e.preventDefault();
      // console.log(e);
      if (e.buttons > 0) {
        // console.log(e);
        if (e.ctrlKey) {
          thiz.raytracing.change_phi(-e.movementX / 10);
          thiz.raytracing.change_lambda(e.movementY / 10);
        } else if (e.shiftKey) {
          thiz.camera.change_d(e.movementX + e.movementY);
        } else {
          thiz.camera.change_phi(-e.movementX / 10);
          thiz.camera.change_lambda(e.movementY / 10);
        }
        thiz.update();

        // thiz.addNode(thiz.viewBox.realX(e.clientX), thiz.viewBox.realY(e.clientY));
      } else {
        // thiz.addPoint(thiz.viewBox.realX(e.clientX), thiz.viewBox.realY(e.clientY));
      }
    }, false);

    document.addEventListener("mouseup", function(e) {
      e.preventDefault();
    }, false);

    document.addEventListener("wheel", function(e) {
      e.preventDefault();
      let k = 1.1;
      if (e.deltaY > 0) {
        k = 1 / k;
      }
      thiz.viewBox.scale(e.clientX, e.clientY, k);
    }, false);

    // // BUTTONs Events
    // this.lb.onclick = function() {
    //   thiz.init();
    // };
    //
    // this.rb.onclick = function() {
    //   thiz.init();
    // };
    //
    // this.db.onclick = function() {
    //   thiz.init();
    // };
    //
    // this.ub.onclick = function() {
    //   thiz.init();
    // };

    // TOUCH events
    this.prevX = null;
    this.prevY = null;

    this.prevPos = null;

    this.getTouchPos = function(e) {
      let thisX = 0;
      let thisY = 0;
      let thisSize = 0;

      for (let touch of e.touches) {
        thisX += touch.clientX;
        thisY += touch.clientY;

        for (let other of e.touches) {
          let l = Math.pow(touch.clientX - other.clientX, 2);
          l += Math.pow(touch.clientY - other.clientY, 2);
          thisSize = Math.max(thisSize, l);
        }
      }

      thisX /= e.touches.length;
      thisY /= e.touches.length;

      thisSize = Math.pow(thisSize, 0.5);

      return {
        x: thisX,
        y: thisY,
        size: thisSize
      };
    }

    this.container.addEventListener("touchstart", function(e) {
      e.preventDefault();
      this.prevPos = thiz.getTouchPos(e);

      console.log("couille");
      thiz.appendVoxel();
    }, false);

    this.container.addEventListener("touchmove", function(e) {
      e.preventDefault();
      let curPos = thiz.getTouchPos(e);

      if (thiz.prevPos != null) {
        // if (e.touches.length > 1) {
        thiz.camera.change_phi(-(curPos.x - thiz.prevPos.x) / 10);
        thiz.camera.change_lambda((curPos.y - thiz.prevPos.y) / 10);
        // }
        thiz.update();
      }
      thiz.prevPos = curPos;
    }, false);

    this.container.addEventListener("touchend", function(e) {
      e.preventDefault();
      thiz.prevPos = null;
    }, false);

    this.container.addEventListener("touchcancel", function(e) {
      e.preventDefault();
    }, false);

    this.container.addEventListener("touchleave", function(e) {
      e.preventDefault();
    }, false);

    // OTHER events
    window.onresize = function(e) {
      thiz.viewBox.resize();
    }

    // window.onerror = function(msg, source, noligne, nocolonne, erreur) {
    //   let str = "";
    //   str += msg;
    //   str += " * ";
    //   str += source;
    //   str += " * ";
    //   str += noligne;
    //   str += " * ";
    //   str += nocolonne;
    //   str += " * ";
    //   // str += erreur;
    //   thiz.console(str);
    // }
  }

}

class ViewBox {
  constructor(parent_, radius_) {
    this.parent = parent_;
    this.radius = radius_;
    let fact = 2 * 1.5 * this.radius / Math.min(window.innerWidth, window.innerHeight);
    this.width = window.innerWidth * fact;
    this.height = window.innerHeight * fact;
    this.xMin = 0; //-this.width / 2;
    this.yMin = 0; //-this.height / 2;
    this.set();
  }

  repr() {
    return this.xMin + " " + this.yMin + " " + this.width + " " + this.height;
  }

  set() {
    this.parent.setAttributeNS(null, 'viewBox', this.repr());
  }

  realX(x) {
    // Returns the "real" X in the viewBox from a click on the parent Dom...
    let domRect = this.parent.getBoundingClientRect();
    return (x - domRect.left) / domRect.width * this.width + this.xMin;
  }

  realY(y) {
    // Returns the "real" Y in the viewBox from a click on the parent Dom...
    let domRect = this.parent.getBoundingClientRect();
    return (y - domRect.top) / domRect.height * this.height + this.yMin;
  }

  // Events
  resize() {
    this.height = this.width * window.innerHeight / window.innerWidth;
    this.set();
  }

  scale(x, y, fact = 1) {
    let coorX = this.realX(x);
    let coorY = this.realY(y);

    this.xMin = coorX - (coorX - this.xMin) / fact;
    this.yMin = coorY - (coorY - this.yMin) / fact;
    this.width /= fact;
    this.height /= fact;
    this.set();
  }

  translate(dx, dy) {
    let domRect = this.parent.getBoundingClientRect();
    this.xMin += dx / domRect.width * this.width;
    this.yMin += dy / domRect.height * this.height;
    this.set();
  }


}