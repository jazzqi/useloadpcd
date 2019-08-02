var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import * as THREE from 'three';
var PCDLoader = /** @class */ (function (_super) {
    __extends(PCDLoader, _super);
    function PCDLoader(manager) {
        var _this = _super.call(this) || this;
        _this.manager =
            manager !== undefined ? manager : THREE.DefaultLoadingManager;
        _this.littleEndian = true;
        _this.path = '';
        return _this;
    }
    PCDLoader.prototype.load = function (url, onLoad, onProgress, onError) {
        var _this = this;
        var loader = new THREE.FileLoader(this.manager);
        loader.setPath(this.path);
        loader.setResponseType('arraybuffer');
        loader.load(url, function (data) {
            try {
                onLoad(_this.parse(data, url));
            }
            catch (e) {
                if (onError) {
                    onError(e);
                }
                else {
                    throw e;
                }
            }
        }, onProgress, onError);
    };
    PCDLoader.prototype.setPath = function (value) {
        this.path = value;
        return this;
    };
    PCDLoader.prototype.parse = function (data, url) {
        var parseHeader = function (headerData) {
            var header = {};
            var result1 = headerData.search(/[\r\n]DATA\s(\S*)\s/i);
            var result2 = /[\r\n]DATA\s(\S*)\s/i.exec(headerData.substr(result1 - 1));
            header.data = result2[1];
            header.headerLen = result2[0].length + result1;
            header.str = headerData.substr(0, header.headerLen);
            // remove comments
            header.str = header.str.replace(/\#.*/gi, '');
            // parse
            header.version = /VERSION (.*)/i.exec(header.str);
            header.fields = /FIELDS (.*)/i.exec(header.str);
            header.size = /SIZE (.*)/i.exec(header.str);
            header.type = /TYPE (.*)/i.exec(header.str);
            header.count = /COUNT (.*)/i.exec(header.str);
            header.width = /WIDTH (.*)/i.exec(header.str);
            header.height = /HEIGHT (.*)/i.exec(header.str);
            header.viewpoint = /VIEWPOINT (.*)/i.exec(header.str);
            header.points = /POINTS (.*)/i.exec(header.str);
            // evaluate
            if (header.version !== null) {
                header.version = parseFloat(header.version[1]);
            }
            if (header.fields !== null)
                header.fields = header.fields[1].split(' ');
            if (header.type !== null)
                header.type = header.type[1].split(' ');
            if (header.width !== null)
                header.width = parseInt(header.width[1], 10);
            if (header.height !== null) {
                header.height = parseInt(header.height[1], 10);
            }
            if (header.viewpoint !== null)
                header.viewpoint = header.viewpoint[1];
            if (header.points !== null) {
                header.points = parseInt(header.points[1], 10);
            }
            if (header.points === null)
                header.points = header.width * header.height;
            if (header.size !== null) {
                header.size = header.size[1].split(' ').map(function (x) {
                    return parseInt(x, 10);
                });
            }
            if (header.count !== null) {
                header.count = header.count[1].split(' ').map(function (x) {
                    return parseInt(x, 10);
                });
            }
            else {
                header.count = [];
                for (var iter = 0, l = header.fields.length; iter < l; iter += 1) {
                    header.count.push(1);
                }
            }
            header.offset = {};
            var sizeSum = 0;
            for (var iter = 0, l = header.fields.length; iter < l; iter += 1) {
                if (header.data === 'ascii') {
                    header.offset[header.fields[iter]] = iter;
                }
                else {
                    header.offset[header.fields[iter]] = sizeSum;
                    sizeSum += header.size[iter];
                }
            }
            // for binary only
            header.rowSize = sizeSum;
            return header;
        };
        var textData = THREE.LoaderUtils.decodeText(data);
        var pcdHeader = parseHeader(textData);
        var position = [];
        var normal = [];
        var color = [];
        if (pcdHeader.data === 'ascii') {
            var offset = pcdHeader.offset;
            var pcdData = textData.substr(pcdHeader.headerLen);
            var lines = pcdData.split('\n');
            for (var iter = 0, l = lines.length; iter < l; iter += 1) {
                if (lines[iter] === '')
                    continue;
                var line = lines[iter].split(' ');
                if (offset.x !== undefined) {
                    position.push(parseFloat(line[offset.x]));
                    position.push(parseFloat(line[offset.y]));
                    position.push(parseFloat(line[offset.z]));
                }
                if (offset.rgb !== undefined) {
                    var rgb = parseFloat(line[offset.rgb]);
                    var r = (rgb >> 16) & 0x0000ff;
                    var g = (rgb >> 8) & 0x0000ff;
                    var b = (rgb >> 0) & 0x0000ff;
                    color.push(r / 255, g / 255, b / 255);
                }
                if (offset.normal_x !== undefined) {
                    normal.push(parseFloat(line[offset.normal_x]));
                    normal.push(parseFloat(line[offset.normal_y]));
                    normal.push(parseFloat(line[offset.normal_z]));
                }
            }
        }
        if (pcdHeader.data === 'binary_compressed') {
            console.error('THREE.PCDLoader: binary_compressed files are not supported');
            return;
        }
        if (pcdHeader.data === 'binary') {
            var dataview = new DataView(data, pcdHeader.headerLen);
            var offset = pcdHeader.offset;
            for (var iter = 0, row = 0; iter < pcdHeader.points; iter += 1, row += pcdHeader.rowSize) {
                if (offset.x !== undefined) {
                    position.push(dataview.getFloat32(row + offset.x, this.littleEndian));
                    position.push(dataview.getFloat32(row + offset.y, this.littleEndian));
                    position.push(dataview.getFloat32(row + offset.z, this.littleEndian));
                }
                if (offset.rgb !== undefined) {
                    color.push(dataview.getUint8(row + offset.rgb + 2) / 255.0);
                    color.push(dataview.getUint8(row + offset.rgb + 1) / 255.0);
                    color.push(dataview.getUint8(row + offset.rgb + 0) / 255.0);
                }
                if (offset.normal_x !== undefined) {
                    normal.push(dataview.getFloat32(row + offset.normal_x, this.littleEndian));
                    normal.push(dataview.getFloat32(row + offset.normal_y, this.littleEndian));
                    normal.push(dataview.getFloat32(row + offset.normal_z, this.littleEndian));
                }
            }
        }
        var geometry = new THREE.BufferGeometry();
        if (position.length > 0) {
            geometry.addAttribute('position', new THREE.Float32BufferAttribute(position, 3));
        }
        if (normal.length > 0) {
            geometry.addAttribute('normal', new THREE.Float32BufferAttribute(normal, 3));
        }
        if (color.length > 0) {
            geometry.addAttribute('color', new THREE.Float32BufferAttribute(color, 3));
        }
        geometry.computeBoundingSphere();
        // build material
        var material = new THREE.PointsMaterial({ size: 0.005 });
        if (color.length > 0) {
            material.vertexColors = THREE.VertexColors;
        }
        else {
            material.color.setHex(Math.random() * 0xffffff);
        }
        // build mesh
        var mesh = new THREE.Points(geometry, material);
        var name = url
            .split('')
            .reverse()
            .join('');
        name = /([^\/]*)/.exec(name);
        name = name[1]
            .split('')
            .reverse()
            .join('');
        mesh.name = name;
        return mesh;
    };
    return PCDLoader;
}(THREE.Loader));
export default PCDLoader;
