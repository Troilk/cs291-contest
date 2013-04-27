function createNormals(geometry, length, color, faceNormals)
{
	var lineGeometry = new THREE.Geometry();

	if(faceNormals)
	{
		for(var i = 0; i < geometry.faces.length; ++i)
		{
			lineGeometry.vertices.push(geometry.faces[i].centroid.clone());
			lineGeometry.vertices.push(geometry.faces[i].centroid.clone().add(geometry.faces[i].normal.clone().multiplyScalar(length)));
		}
	}
	else
	{
		if(geometry.normals.length > 0)
			for(var i = 0; i < geometry.vertices.length; ++i)
			{
				lineGeometry.vertices.push(geometry.vertices[i].clone());
				lineGeometry.vertices.push(geometry.vertices[i].clone().add(geometry.normals[i].clone().multiplyScalar(length)));
			}
		else
			for(var i = 0; i < geometry.faces.length; ++i)
			{
				if(geometry.faces[i].vertexNormals.length === 0)
					continue;

				var v11 = geometry.vertices[geometry.faces[i].a].clone();
				var v21 = geometry.vertices[geometry.faces[i].b].clone();
				var v31 = geometry.vertices[geometry.faces[i].c].clone();

				var v12 = v11.clone().add(geometry.faces[i].vertexNormals[0].clone().multiplyScalar(length));
				var v22 = v21.clone().add(geometry.faces[i].vertexNormals[1].clone().multiplyScalar(length));
				var v32 = v31.clone().add(geometry.faces[i].vertexNormals[2].clone().multiplyScalar(length));

				lineGeometry.vertices.push(v11);
				lineGeometry.vertices.push(v12);
				lineGeometry.vertices.push(v21);
				lineGeometry.vertices.push(v22);
				lineGeometry.vertices.push(v31);
				lineGeometry.vertices.push(v32);

				//if Face4
				if(geometry.faces[i].d)
				{
					var v41 = geometry.vertices[geometry.faces[i].d].clone();
					var v42 = v41.clone().add(geometry.faces[i].vertexNormals[3].clone().multiplyScalar(length));
					lineGeometry.vertices.push(v41);
					lineGeometry.vertices.push(v42);
				}
			}
	}

	var material = new THREE.LineBasicMaterial({
        color: color
    });

    return new THREE.Line( lineGeometry, material, THREE.LinePieces );
}