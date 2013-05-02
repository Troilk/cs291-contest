TubeGeometry = function ( innerRadiusTop, innerRadiusBottom, outerRadiusTop, outerRadiusBottom, innerHeight, outerHeight, radiusSegments, heightSegments, openEnded, endSegments, rangeAngle, modifier ) {

	THREE.Geometry.call( this );

	innerRadiusTop = innerRadiusTop !== undefined ? innerRadiusTop : 20;
	innerRadiusBottom = innerRadiusBottom !== undefined ? innerRadiusBottom : 20;
	outerRadiusTop = outerRadiusTop !== undefined ? outerRadiusTop : 24;
	outerRadiusBottom = outerRadiusBottom !== undefined ? outerRadiusBottom : 24; 
	innerHeight = innerHeight !== undefined ? innerHeight : 100;
	outerHeight = outerHeight !== undefined ? outerHeight : 100;
	openEnded = openEnded !== undefined ? openEnded : false;
	endSegments = endSegments !== undefined ? endSegments : 1;
	rangeAngle = rangeAngle !== undefined ? rangeAngle : 360;

	var i_heightHalf = innerHeight * 0.5;
	var o_heightHalf = outerHeight * 0.5;
	var segmentsX = radiusSegments || 8;
	var segmentsY = heightSegments || 1;

	var x, y, vertices = [], uvs = [], vm;

	//generating vertices
	for ( y = 0; y <= segmentsY; ++y ) { 

		var v = y / segmentsY;
		var i_radius = v * ( innerRadiusBottom - innerRadiusTop ) + innerRadiusTop;
		var o_radius = v * ( outerRadiusBottom - outerRadiusTop ) + outerRadiusTop;
		if(modifier)
		{
			vm = modifier(v);
			i_radius *= vm;
			o_radius *= vm;
		}

		var verticesRow = { inner: [], outer: [], i_rad: i_radius, o_rad: o_radius };

		for ( x = 0; x <= segmentsX; ++x ) {

			var u = x / segmentsX;

			var i_vertex = new THREE.Vector3();
			i_vertex.x = i_radius * Math.sin( u * rangeAngle );
			i_vertex.y = - v * innerHeight + i_heightHalf;
			i_vertex.z = i_radius * Math.cos( u * rangeAngle );

			var o_vertex = new THREE.Vector3();
			o_vertex.x = o_radius * Math.sin( u * rangeAngle );
			o_vertex.y = - v * outerHeight + o_heightHalf;
			o_vertex.z = o_radius * Math.cos( u * rangeAngle );

			this.vertices.push( i_vertex );
			this.vertices.push( o_vertex );

			verticesRow.inner.push( this.vertices.length - 2 );
			verticesRow.outer.push( this.vertices.length - 1 );
		}

		vertices.push( verticesRow );
	}

	if(modifier)
	{
		vm = modifier(1);
		outerRadiusBottom *= vm;
		innerRadiusBottom *= vm;
		vm = modifier(0);
		outerRadiusTop *= vm;
		innerRadiusTop *= vm;
	}

	if(!openEnded && endSegments > 1)
	{
		//var t_heightDelta = outerRadiusTop - innerRadiusTop + innerHeight - outerHeight;
		//var b_heightDelta = outerRadiusBottom - innerRadiusBottom;
		var offset =0.5;//(0.5 - (innerHeight - outerHeight) / Math.max(innerHeight, outerHeight));
		var top = Math.max(i_heightHalf, o_heightHalf) + (outerRadiusTop - innerRadiusTop) * 0.4;//offset * offset;
		//var top = (i_heightHalf - o_heightHalf) * 0.5 + o_heightHalf + (outerRadiusTop - innerRadiusTop) * 0.4;

		for(y = 1; y < endSegments; ++y)
		{
			var v = y / endSegments;
			var t_radius = v * ( outerRadiusTop - innerRadiusTop ) + innerRadiusTop;
			var b_radius = v * ( outerRadiusBottom - innerRadiusBottom ) + innerRadiusBottom;

			var vo = v - offset;
			//v -= offset;
			//v -= 0.5;
			vo = -(vo * vo) + (offset * offset);
			var yPos = v > 0.5 ? (vo * 4 * (top - o_heightHalf) + o_heightHalf) : (vo * 4 * (top - i_heightHalf) + i_heightHalf);
			var verticesRow = { top: [], bottom: [],  t_rad: t_radius, b_rad: b_radius, height: yPos };

			for ( x = 0; x <= segmentsX; ++x ) {

				var u = x / segmentsX;

				var t_vertex = new THREE.Vector3();
				t_vertex.x = t_radius * Math.sin( u * rangeAngle );
				//t_vertex.y = v * t_heightDelta + o_heightHalf;
				t_vertex.y = yPos;
				t_vertex.z = t_radius * Math.cos( u * rangeAngle );

				var b_vertex = new THREE.Vector3();
				b_vertex.x = b_radius * Math.sin( u * rangeAngle );
				//b_vertex.y = - v * b_heightDelta - o_heightHalf;
				b_vertex.y = -yPos;
				b_vertex.z = b_radius * Math.cos( u * rangeAngle );

				this.vertices.push( t_vertex );
				this.vertices.push( b_vertex );

				verticesRow.top.push( this.vertices.length - 2 );
				verticesRow.bottom.push( this.vertices.length - 1 );
			}

			vertices.push( verticesRow );
		}
	}

	//generating side faces
	// var i_tanTheta = ( innerRadiusBottom - innerRadiusTop ) / innerHeight;
	// var o_tanTheta = ( outerRadiusBottom - outerRadiusTop ) / outerHeight;
	var i_tanTheta, o_tanTheta, o_temp, i_temp, i_prevTan, o_prevTan, i_firstTan, o_firstTan;
	var i_na, i_nb, o_na, o_nb, prevNormal = null;
	var i_heightDelta = segmentsY / innerHeight, o_heightDelta = segmentsY / outerHeight;

	for ( x = 0; x < segmentsX; ++x ) 
	{
		i_prevTan = o_prevTan = undefined;
		for ( y = 0; y < segmentsY; ++y ) 
		{

			i_temp = (vertices[ y + 1 ].i_rad - vertices[ y ].i_rad) * i_heightDelta;
			o_temp = (vertices[ y + 1 ].o_rad - vertices[ y ].o_rad) * o_heightDelta;

			if(i_prevTan)
			{
				i_tanTheta = Math.tan((Math.atan(i_temp) + Math.atan(i_prevTan)) * 0.5);
				o_tanTheta = Math.tan((Math.atan(o_temp) + Math.atan(o_prevTan)) * 0.5);
			}
			else
			{
				i_tanTheta = i_temp;
				o_tanTheta = o_temp;
			}

			i_prevTan = i_temp;
			o_prevTan = o_temp;

			//if ( innerRadiusTop !== 0 ) {

				i_na = this.vertices[ vertices[ y ].inner[ x ] ].clone();
				i_nb = this.vertices[ vertices[ y ].inner[ x + 1 ] ].clone();

			// } else {

			// 	i_na = this.vertices[ vertices[ y ].inner[ x ] ].clone();
			// 	i_nb = this.vertices[ vertices[ y ].inner[ x + 1 ] ].clone();

			// }

			//if ( outerRadiusTop !== 0 ) {

				o_na = this.vertices[ vertices[ y ].outer[ x ] ].clone();
				o_nb = this.vertices[ vertices[ y ].outer[ x + 1 ] ].clone();

			// } else {

			// 	o_na = this.vertices[ vertices[ y ].outer[ x ] ].clone();
			// 	o_nb = this.vertices[ vertices[ y ].outer[ x + 1 ] ].clone();

			// }

			i_na.setY( Math.sqrt( i_na.x * i_na.x + i_na.z * i_na.z ) * i_tanTheta ).normalize().negate();
			i_nb.setY( Math.sqrt( i_nb.x * i_nb.x + i_nb.z * i_nb.z ) * i_tanTheta ).normalize().negate();
			o_na.setY( Math.sqrt( o_na.x * o_na.x + o_na.z * o_na.z ) * o_tanTheta ).normalize();
			o_nb.setY( Math.sqrt( o_nb.x * o_nb.x + o_nb.z * o_nb.z ) * o_tanTheta ).normalize();

			if(y > 0)
			{
				this.faces[this.faces.length - 2].vertexNormals[2] = i_na.clone();
				this.faces[this.faces.length - 2].vertexNormals[1] = i_nb.clone();

				this.faces[this.faces.length - 1].vertexNormals[1] = o_na.clone();
				this.faces[this.faces.length - 1].vertexNormals[2] = o_nb.clone();
			}
			else
			{
				i_firstTan = i_tanTheta;
				o_firstTan = o_tanTheta;
			}

			// if(modifier && prevNormal !== null)
			// {
			// 	i_na.setY( (i_na.y + prevNormal.ia[x]) * 0.5 ).normalize();
			// 	i_nb.setY( (i_nb.y + prevNormal.ib[x]) * 0.5 ).normalize();
			// 	o_na.setY( (o_na.y + prevNormal.oa[x]) * 0.5 ).normalize();
			// 	o_nb.setY( (o_nb.y + prevNormal.ob[x]) * 0.5 ).normalize();
			// }

			// prevNormal = {} ;
				//i_na, i_nb, o_na, o_nb make them middle between current state and previous normal (avarage and normalize)

			var i_v1 = vertices[ y ].inner[ x + 1 ];
			var i_v2 = vertices[ y + 1 ].inner[ x + 1];
			var i_v3 = vertices[ y + 1 ].inner[ x ];
			var i_v4 = vertices[ y ].inner[ x ];

			var o_v1 = vertices[ y ].outer[ x ];
			var o_v2 = vertices[ y + 1 ].outer[ x ];
			var o_v3 = vertices[ y + 1 ].outer[ x + 1 ];
			var o_v4 = vertices[ y ].outer[ x + 1 ];

			var i_n1 = i_nb.clone();
			var i_n2 = i_nb.clone();
			var i_n3 = i_na.clone();
			var i_n4 = i_na.clone();

			var o_n1 = o_na.clone();
			var o_n2 = o_na.clone();
			var o_n3 = o_nb.clone();
			var o_n4 = o_nb.clone();

			this.faces.push( new THREE.Face4( i_v1, i_v2, i_v3, i_v4, [ i_n1, i_n2, i_n3, i_n4 ] ) );
			this.faces.push( new THREE.Face4( o_v1, o_v2, o_v3, o_v4, [ o_n1, o_n2, o_n3, o_n4 ] ) );
		}
	}

	//tube caps
	if(!openEnded)
	{
		if(endSegments > 1)
		{
			var i, prevTan, tan;
			if(innerRadiusTop !== outerRadiusTop)
			{
				prevTan = i_firstTan; //-(vertices[ y + 1 ].t_rad - vertices[ 0 ].i_rad) / (-i_heightHalf + vertices[ y + 1 ].height);
				var tans = [ prevTan ];

				for(i = y + 1; i < y + endSegments - 1; ++i)
				{
					tan = -(vertices[ i + 1 ].t_rad - vertices[ i ].t_rad) / (-vertices[ i ].height + vertices[ i + 1 ].height);
					tans.push(Math.tan((Math.atan(tan) + Math.atan(prevTan)) * 0.5));
					prevTan = tan;
				}
				tans.push(Math.tan((Math.atan(-o_firstTan) + Math.atan(prevTan)) * 0.5));
				tans.push(o_firstTan);

				connectCircles(vertices[y + 1].top, vertices[0].inner, this.faces, this.vertices, tans[1], tans[0], 1);

				var type;
				for(i = y + 1; i < y + endSegments - 1; ++i)
				{
					type = (i - y + 1 < endSegments * 0.5) ? 1 : (i - y === endSegments * 0.5 || i - y + 1 === endSegments * 0.5) ? 2 : 0;
					if(type === 2)
						connectCircles(vertices[i + 1].top, vertices[i].top, this.faces, this.vertices, tans[i - y], tans[i - y], type);
					else
						connectCircles(vertices[i + 1].top, vertices[i].top, this.faces, this.vertices, tans[i - y + 1], tans[i - y], type);
				}

				connectCircles(vertices[0].outer, vertices[y + endSegments - 1].top, this.faces, this.vertices, tans[tans.length - 1], tans[tans.length - 2]);
			}
			if(innerRadiusBottom !== outerRadiusBottom)
			{
				connectCircles(vertices[y].inner, vertices[y + 1].bottom, this.faces);
				connectCircles(vertices[y + endSegments - 1].bottom, vertices[y].outer, this.faces);
				for(i = y + 1; i < y + endSegments - 1; ++i)
					connectCircles(vertices[i].bottom, vertices[i + 1].bottom, this.faces);
			}
		}
		else
		{
			if(innerRadiusTop !== outerRadiusTop)
			{
				connectCircles(vertices[0].outer, vertices[0].inner, this.faces);
			}

			if(innerRadiusBottom !== outerRadiusBottom)
			{
				connectCircles(vertices[y].inner, vertices[y].outer, this.faces);
			}
		}
	}

	if(!openEnded && rangeAngle < Math.PI * 2)
	{
		for(y = 0; y < segmentsY; ++y)
		{
			var v11 = vertices[y].outer[0];
			var v21 = vertices[y].inner[0];
			var v31 = vertices[y + 1].inner[0];
			var v41 = vertices[y + 1].outer[0];

			var v12 = vertices[y].outer[x];
			var v22 = vertices[y].inner[x];
			var v32 = vertices[y + 1].inner[x];
			var v42 = vertices[y + 1].outer[x];

			this.faces.push( new THREE.Face4( v11, v21, v31, v41 ) );
			this.faces.push( new THREE.Face4( v22, v12, v42, v32 ) );
		}

		if(endSegments > 1)
		{
			var tv1 = vertices[ 0 ].inner[ 0 ];
			var tv2 = vertices[ 0 ].inner[ segmentsX ];
			var bv1 = vertices[ segmentsY ].inner[ 0 ];
			var bv2 = vertices[ segmentsY ].inner[ segmentsX ];

			for(y = segmentsY + 1; y < endSegments + segmentsY - 1; ++y)
			{
				var tv11 = vertices[ y ].top[0];
				var tv12 = vertices[ y + 1 ].top[0];
				var tv21 = vertices[ y ].top[ segmentsX ];
				var tv22 = vertices[ y + 1 ].top[ segmentsX ];

				var bv11 = vertices[ y ].bottom[ 0 ];
				var bv12 = vertices[ y + 1 ].bottom[ 0 ];
				var bv21 = vertices[ y ].bottom[ segmentsX ];
				var bv22 = vertices[ y + 1 ].bottom[ segmentsX ];

				this.faces.push( new THREE.Face3( tv1, tv12, tv11 ) );
				this.faces.push( new THREE.Face3( tv2, tv21, tv22 ) );
				this.faces.push( new THREE.Face3( bv1, bv11, bv12 ) );
				this.faces.push( new THREE.Face3( bv2, bv22, bv21 ) );
			}

			this.faces.push( new THREE.Face3( tv1, vertices[0].outer[0], vertices[ y ].top[0] ) );
			this.faces.push( new THREE.Face3( tv2, vertices[ y ].top[segmentsX], vertices[0].outer[segmentsX] ) );
			this.faces.push( new THREE.Face3( bv1, vertices[ y ].bottom[0], vertices[segmentsY].outer[0] ) );
			this.faces.push( new THREE.Face3( bv2, vertices[ segmentsY ].outer[segmentsX], vertices[ y ].bottom[segmentsX] ) );
		}
	}

	this.computeCentroids();
	this.computeFaceNormals();

}

function connectCircles(verticesRow1, verticesRow2, faces, vertices, tan1, tan2, type)
{
	for ( var x = 0; x < verticesRow1.length - 1; ++x ) 
	{
		var v1 = verticesRow1[ x + 1 ];
		var v2 = verticesRow2[ x + 1 ];
		var v3 = verticesRow2[ x ];
		var v4 = verticesRow1[ x ];

		if(vertices)
		{
			var vn1 = vertices[verticesRow1[ x + 1 ]].clone();
			var vn2 = vertices[verticesRow2[ x + 1 ]].clone();
			var vn3 = vertices[verticesRow2[ x ]].clone();
			var vn4 = vertices[verticesRow1[ x ]].clone();
			vn1.setY( Math.sqrt( vn1.x * vn1.x + vn1.z * vn1.z ) * tan1 ).normalize();
			vn2.setY( Math.sqrt( vn2.x * vn2.x + vn2.z * vn2.z ) * tan2 ).normalize();
			vn3.setY( Math.sqrt( vn3.x * vn3.x + vn3.z * vn3.z ) * tan2 ).normalize();
			vn4.setY( Math.sqrt( vn4.x * vn4.x + vn4.z * vn4.z ) * tan1 ).normalize();
			if(type === 1)
			{
				vn1.negate();
				vn2.negate();
				vn3.negate();
				vn4.negate();
			}
			// else if(type === 2)
			// {
			// 	vn1.setY(1).normalize();
			// 	vn2.setY(1).normalize();
			// 	vn3.setY(1).normalize();
			// 	vn4.setY(1).normalize();
			// }

			faces.push( new THREE.Face4( v1, v2, v3, v4, [ vn1, vn2 , vn3, vn4 ] ) );
		}
		else
			faces.push( new THREE.Face4( v1, v2, v3, v4 ) );
	}
}

TubeGeometry.prototype = Object.create( THREE.Geometry.prototype );