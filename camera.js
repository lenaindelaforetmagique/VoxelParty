var DEG_TO_RAD = Math.PI / 180;

class Camera {
  constructor(parent_) {
    this.parent = parent_;
    this.lambda = 5; // latitude
    this.phi = 175; // longitude
    this.rr = 1000; // distance of screen
    this.d = -this.rr * 0.79; // distance of convergence point
    this.ux = new Vector3D(-1, 1, 0);
    this.uy = new Vector3D(0, 0, -1);
    this.uz = new Vector3D(-1, -1, 0);
    this.ux.normalize();
    this.uz.normalize();


    this.ux_speed = 0;
    this.uz_speed = 0;
    this.Z_rotSpeed = 0;
    this.ux_rotSpeed = 0;

    this.ux_sign = 1;

    this.position = new Vector3D(0, 0, 0);
    this.longSpeed = -1;

    this.update_vectors();
    // this.position = this.uz.copy();
    this.position.mult(1000);
    // console.log(this.position);
  }

  update(dt) {
    dt /= 50;
    this.moveX(dt * this.ux_speed);
    this.moveZ(dt * this.uz_speed);


    this.position.z = this.parent.landscape.altitude(this.position.x, this.position.y) + 10;


    this.rotate_Z(dt * this.Z_rotSpeed);
    this.rotate_ux(dt * this.ux_rotSpeed);

    this.ux_speed = 0;
    this.uz_speed = 0;
    // this.Z_rotSpeed = 0;
    // this.ux_rotSpeed = 0;
  }

  PROJ_FUNCTION(vector) {
    let vect2 = vector.copy();
    // console.log("la");
    // console.log(this.position);
    vect2.sub(this.position);
    var newX = this.ux.dotProduct(vect2);
    var newY = this.uy.dotProduct(vect2);
    var newZ = this.uz.dotProduct(vect2);
    // console.log(newZ);
    // let fact = this.d / (this.d + this.rr - newZ) / (this.d / (this.d + this.rr));
    let fact = (this.d + this.rr) / (this.d + this.rr - newZ);
    return [newX * fact, newY * fact, newZ];
  }

  isVisible(polygon) {
    let res = true;
    for (let node of polygon.nodes) {
      let projPos = this.PROJ_FUNCTION(node.position);
      res &= (projPos[2] < 2);
    }
    return res;
  }

  update_vectors() {
    this.uz = new Vector3D(
      Math.cos(this.lambda * DEG_TO_RAD) * Math.cos(this.phi * DEG_TO_RAD),
      Math.cos(this.lambda * DEG_TO_RAD) * Math.sin(this.phi * DEG_TO_RAD),
      Math.sin(this.lambda * DEG_TO_RAD));

    this.ux.x = -this.uz.y;
    this.ux.y = +this.uz.x;
    this.ux.z = 0;

    this.ux.normalize();
    this.ux.mult(this.ux_sign);

    this.uy = this.ux.crossProduct(this.uz);

    // console.log(this.lambda, this.phi);
  }


  set_lat_speed(alpha) {
    // alpha [0;1] for [+90,-90]
    // coupled with rotate ux
    this.ux_rotSpeed = (alpha) / 2;
  }

  set_long_speed(alpha) {
    this.Z_rotSpeed = alpha / 2;
  }

  set_lat(alpha) {
    // alpha [0;1] for [+90,-90]
    // coupled with rotate ux
    alpha = (90 - 180 * alpha) * DEG_TO_RAD;
    let curLat = Math.asin(this.uz.z);
    this.rotate_ux(-(alpha + curLat));
  }

  set_long(alpha) {
    // alpha [0;1] for [-360,+360]
    // coupled with rotate Z
    alpha = (360 * 3 * alpha) * DEG_TO_RAD;
    // console.log(alpha);
    let uz2 = this.uz.copy();
    uz2.z = 0;
    uz2.normalize();
    let curLong = Math.acos(uz2.y);

    if (uz2.x < 0) {
      curLong *= -1;
    }
    this.rotate_Z(alpha + curLong);
  }

  rotate_ux(d_alpha = 0) {
    let teta = Math.asin(this.uz.z);
    d_alpha = Math.min(d_alpha, (0.7 * Math.PI / 2 - teta));
    d_alpha = Math.max(d_alpha, (-0.45 * Math.PI / 2 - teta));

    this.uy.rotate(this.ux, d_alpha);
    this.uz.rotate(this.ux, d_alpha);
  }

  rotate_uz(angle) {
    this.ux.rotate(this.uz, angle);
    this.uy.rotate(this.uz, angle);
  }

  rotate_Z(angle) {
    let globalZ = new Vector3D(0, 0, 1);


    this.ux.rotate(globalZ, angle);
    this.uy.rotate(globalZ, angle);
    this.uz.rotate(globalZ, angle);
  }


  moveX(intensity = 0) {
    let dx = this.ux.copy();
    dx.z = 0;
    dx.normalize();
    dx.mult(intensity);
    this.position.add(dx);
  }

  moveZ(intensity = 0) {
    let dz = this.uz.copy();
    dz.z = 0;
    dz.normalize();
    dz.mult(intensity);
    this.position.add(dz);
  }

  change_d(intensity = 0) {
    this.d += intensity * 10;
    this.d = Math.max(-this.rr * 0.79, this.d);
    console.log(this.d);
  }


  change_phi(intensity = 0) {
    this.phi += intensity * 10 * this.ux_sign;
  }

  change_lambda(intensity = 0) {
    this.lambda += intensity * 10 * this.ux_sign;
    if (this.lambda > 90) {
      this.lambda = 180 - this.lambda;
      this.phi += 180;
      this.ux_sign *= -1;

    } else if (this.lambda < -90) {
      this.lambda = -180 - this.lambda;
      this.phi += 180;
      this.ux_sign *= -1;
    }
    // this.lambda = Math.max(-90, Math.min(this.lambda, 90));
  }
}