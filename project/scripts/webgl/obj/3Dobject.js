//INITWORLD
function worldObject(parent) {
    this.localTransformation = mat4.create();
    this.orbitTransformation = mat4.create();
    this.revolutionTransformation = mat4.create();
    this.children = [];
    this.vertexPositionBuffer = null;
    this.vertexTextureCoordBuffer = null;
    this.vertexIndexBuffer = null;
    this.toggled = true;
    this.revolutionParam = 0;
    this.orbitParam = 0;
    // il faudra sans doute ajouter des choses ici pour gérer les nomales
    this.texture = null;
    mat4.identity(this.orbitTransformation);
    mat4.identity(this.localTransformation);
    mat4.identity(this.revolutionTransformation);
    if (parent != null) parent.addChild(this);
}

worldObject.prototype.addChild = function (child) {
    this.children.push(child);
}

worldObject.prototype.translate = function (translation) {
    mat4.translate(this.localTransformation, translation);
}

worldObject.prototype.rotate = function (rotation, axis) {
    mat4.rotate(this.revolutionTransformation, rotation, axis);
}

worldObject.prototype.orbit = function (rotation, axis) {
    mat4.rotate(this.orbitTransformation, rotation, axis);
}

worldObject.prototype.scale = function (scale) {
    mat4.scale(this.localTransformation, scale);
}

worldObject.prototype.draw = function () {
    if (this.toggled) {
        if (this.texture != null) {
            //gl.activeTexture(this.texture.getbind()); todo issue
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.uniform1i(shaderProgram.samplerUniform, this.texture.bindNumber);
        }

        mvPushMatrix();
        mat4.multiply(mvMatrix, this.orbitTransformation);
        mat4.multiply(mvMatrix, this.localTransformation);

        mvPushMatrix();
        mat4.multiply(mvMatrix, this.revolutionTransformation);


        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer);
        gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, this.vertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

        // il faudra sans doute ajouter des choses ici pour gérer les nomales todo

        setMatrixUniforms();
        if (this.vertexIndexBuffer == null) {
            gl.drawArrays(drawStyle, 0, this.vertexPositionBuffer.numItems);
        }
        else {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
            gl.drawElements(drawStyle, this.vertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        }
        //eviter que la revolution des enfants soit influencé par la mienne
        mvPopMatrix();

        //draws children
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].draw();
        }
        mvPopMatrix();
    }
}

worldObject.prototype.animate = function (elapsedTime) {
    //animate children
    for (var i = 0; i < this.children.length; i++) {
        this.children[i].animate(elapsedTime);
    }
    this.orbit(this.orbitParam * 0.001 * elapsedTime, [0, 1, 0]); // cette ligne est surement discutable comme animation par défaut!
    this.rotate(this.revolutionParam * 0.001 * elapsedTime, [0, 1, 0]);
};