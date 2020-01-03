class Voxel {
  constructor(parent_, x_ = 0, y_ = 0, z_ = 0, size_, color_) {
    this.parent = parent_;
    this.nodes = [];
    this.faces = [];
    this.color = Math.random() * 360; //colorGeneratorRGBA(Math.random() * 255, Math.random() * 255, Math.random() * 255, 1);
    this.position = new Vector3D(x_, y_, z_);
    this.size = size_;

    this.color = color_;
    this.init();
  }

  init() {
    this.nodes = [];
    let x0 = this.position.x;
    let y0 = this.position.y;
    let z0 = this.position.z;

    this.nodes.push(new Node(this.parent, x0, y0, z0));
    this.nodes.push(new Node(this.parent, x0, y0 + this.size, z0));
    this.nodes.push(new Node(this.parent, x0 + this.size, y0, z0));
    this.nodes.push(new Node(this.parent, x0 + this.size, y0 + this.size, z0));

    this.nodes.push(new Node(this.parent, x0, y0, z0 + this.size));
    this.nodes.push(new Node(this.parent, x0, y0 + this.size, z0 + this.size));
    this.nodes.push(new Node(this.parent, x0 + this.size, y0, z0 + this.size));
    this.nodes.push(new Node(this.parent, x0 + this.size, y0 + this.size, z0 + this.size));

    this.faces = [];
    this.addQuadrangle(0, 1, 3, 2);
    this.addQuadrangle(0, 4, 5, 1);
    this.addQuadrangle(0, 2, 6, 4);
    this.addQuadrangle(1, 5, 7, 3);
    this.addQuadrangle(2, 3, 7, 6);
    this.addQuadrangle(4, 6, 7, 5);
  }

  addQuadrangle(id1, id2, id3, id4) {
    let newQuadrangle = new Quadrangle(
      this.parent,
      this.nodes[id1],
      this.nodes[id2],
      this.nodes[id3],
      this.nodes[id4]
    );
    newQuadrangle.color = this.color;
    this.faces.push(newQuadrangle);
  }
}