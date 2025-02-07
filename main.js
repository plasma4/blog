const blogTitles = ["go to home", "first blog entry", "very fast car"]
const backgroundDisabled = false

const RED = ["#fd361833", [1, 0.2, 0], [0.9, 0.1, 0.1], [0.6, 0.1, 0]]
const ORANGE = ["#f3913533", [1, 1, 0.4], [0.2, 0.2, 0], [0.4, 0, 0]]
const GREEN = ["#32d29333", [0.2, 1, 0.1], [0.3, 0.8, 0], [0, 1, 0.1]]
const BLUE = ["#89c2f433", [0, 1, 1], [0, 1, 1], [0, 0, 1]]
const PURPLE = ["#e84ef633", [1.8, 0, 2], [0, 0, 1], [1, 0, 1]]

var backgroundColor1 = [0, 0, 0]
var backgroundColor2 = [0, 0, 0]
var backgroundColor3 = [0, 0, 0]
var timestampShift = 0

function selectBackground() {
    var color = [ORANGE, GREEN, BLUE, PURPLE][Math.floor(Math.random() * 4)]
    timestampShift = Math.floor(Math.random() * 100000000)
    document.body.style.backgroundColor = color[0]
    updateBackgroundColors(color[1], color[2], color[3])
}

document.addEventListener("DOMContentLoaded", function () {
    var bgButton = document.getElementById("changeBG")
    if (bgButton !== null) {
        bgButton.addEventListener("click", selectBackground)
    }
})

// -------------------------
// -------------------------
// -------------------------

/**
 * Code from https://demonin.com/games/checkBackInfiniteDescent/background.js and used with prior permission.
 */

const canvas = document.getElementsByTagName("canvas")[0]
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

if (backgroundDisabled) { canvas.style.display = 'none' }
else { canvas.style.display = 'block' }

const vertexShaderSource = `
    attribute vec4 a_position;
    void main() {
        gl_Position = a_position;
    }
`

const fragmentShaderSource = `
    precision highp float;
    uniform vec2 resolution;
    uniform float time;

    void main()
    {
        vec2 uv = -1.0 + 2.0*gl_FragCoord.xy / resolution.xy;
        uv.x *=  resolution.x / resolution.y;
        vec3 color = vec3(0.0);
        for( int i=0; i<128; i++ )
        {
            float pha =      sin(float(i)*546.13+1.0)*0.5 + 0.5;
            float siz = pow( sin(float(i)*651.74+5.0)*0.5 + 0.5, 4.0 );
            float pox =      sin(float(i)*321.55+4.1) * resolution.x / resolution.y;
            float rad = 0.1+0.5*siz+sin(pha+siz)/4.0;
            vec2  pos = vec2( pox+sin(time/15.+pha+siz), -1.0-rad + (2.0+2.0*rad)*mod(pha+0.3*(time/7.)*(0.2+0.8*siz),1.0));
            float dis = length( uv - pos );
            vec3  col = mix( vec3(0.194*sin(time/6.0)+0.3,0.2,0.3*pha), vec3(1.1*sin(time/9.0)+0.3,0.2*pha,0.4), 0.5+0.5*sin(float(i)));
            float f = length(uv-pos)/rad;
            f = sqrt(clamp(1.0+(sin((time)*siz)*0.5)*f,0.0,1.0));
            color += col.zyx *(1.0-smoothstep( rad*0.15, rad, dis ));
        }
        color *= sqrt(1.5-0.5*length(uv));
        gl_FragColor = vec4(color,1.0);
    }

`

function createShader(gl, type, source) {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader))
        console.error('Shader source:', source)
        gl.deleteShader(shader)
        return null
    }
    return shader
}

// Function to create and link a shader program
function createShaderProgram(gl, vertexSource, fragmentSource) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource)

    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    //if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    //    console.error('Error linking program:', gl.getProgramInfoLog(program))
    //    return null
    //}

    return program
}

const vertices = new Float32Array([
    -1, -1,
    1, -1,
    -1, 1,
    1, 1
])

const vertexBuffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

// Function to initialize the shader program
function initShaderProgram() {
    shaderProgram = createShaderProgram(gl, vertexShaderSource, fragmentShaderSource)

    if (!shaderProgram) return
    gl.useProgram(shaderProgram)
    const a_position = gl.getAttribLocation(shaderProgram, 'a_position')
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.enableVertexAttribArray(a_position)
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0)

    resolutionUniformLocation = gl.getUniformLocation(shaderProgram, 'resolution')
    timeUniformLocation = gl.getUniformLocation(shaderProgram, 'time')
    //backgroundColor1UniformLocation = gl.getUniformLocation(shaderProgram, 'u_color1')
    //backgroundColor2UniformLocation = gl.getUniformLocation(shaderProgram, 'u_color2')
    //backgroundColor3UniformLocation = gl.getUniformLocation(shaderProgram, 'u_color3')
}

// Initialize shaders and buffer
initShaderProgram()

function render(timestamp) {
    timestamp += timestampShift
    if (backgroundDisabled) { requestAnimationFrame(render); return }
    canvas.width = Math.min(Math.pow(innerWidth + 2, 0.6) + 40, innerWidth)
    canvas.height = Math.pow(innerHeight + 4, 0.6)
    gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height)
    gl.uniform1f(timeUniformLocation, timestamp / 1000.0)
    // gl.uniform3f(backgroundColor1UniformLocation,  backgroundColor1[0], backgroundColor1[1], backgroundColor1[2])
    //gl.uniform3f(backgroundColor2UniformLocation, backgroundColor2[0], backgroundColor2[1], backgroundColor2[2])
    //gl.uniform3f(backgroundColor3UniformLocation, backgroundColor3[0], backgroundColor3[1], backgroundColor3[2])
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    requestAnimationFrame(render)
}


function enableDisableBackground() {
    backgroundDisabled = !backgroundDisabled
    if (backgroundDisabled) { canvas.style.display = 'none' }
    else { canvas.style.display = 'block' }
}

function updateBackgroundColors(a, b, c) {
    backgroundColor1 = a
    backgroundColor2 = b
    backgroundColor3 = c
}

selectBackground()
requestAnimationFrame(render)

// -------------------------
// -------------------------
// -------------------------

/**
 * drawdown.js
 * (c) Adam Leggett

MIT License

Copyright (c) 2016 Adam Leggett

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */

function markdown(src) {
    var rx_blogdata = /^\$\$([0-9]+?)(.*)$/gm // Custom regex to select blogdata
    var rx_button = /^::(.+)\|(.+)$/gm // Custom button regex
    var rx_lt = /</g
    var rx_gt = />/g
    var rx_space = /\t|\r|\uf8ff/g
    var rx_escape = /\\([\\\|`*_{}\[\]()#+\-~])/g
    var rx_hr = /^([*\-=_] *){3,}$/gm
    var rx_blockquote = /\n *&gt *([^]*?)(?=(\n|$){2})/g
    var rx_list = /\n( *)(?:[*\-+]|((\d+)|([a-z])|[A-Z])[.)]) +([^]*?)(?=(\n|$){2})/g
    var rx_listjoin = /<\/(ol|ul)>\n\n<\1>/g
    var rx_highlight = /(^|[^A-Za-z\d\\])(([*_])|(~)|(\^)|(--)|(\+\+)|`)(\2?)([^<]*?)\2\8(?!\2)(?=\W|_|$)/g
    var rx_code = /\n((```|~~~).*\n?([^]*?)\n?\2|((    .*?\n)+))/g
    var rx_link = /((!?)\[(.*?)\]\((.*?)( ".*")?\)|\\([\\`*_{}\[\]()#+\-.!~]))/g
    var rx_table = /\n(( *\|.*?\| *\n)+)/g
    var rx_thead = /^.*\n( *\|( *\:?-+\:?-+\:? *\|)* *\n|)/
    var rx_row = /.*\n/g
    var rx_cell = /\||(.*?[^\\])\|/g
    var rx_heading = /(?=^|>|\n)([>\s]*?)(#{1,6}) (.*?)( #*)? *(?=\n|$)/g
    var rx_para = /(?=^|>|\n)\s*\n+([^<]+?)\n+\s*(?=\n|<|$)/g
    var rx_stash = /-\d+\uf8ff/g

    function replace(rex, fn) {
        src = src.replace(rex, fn)
    }

    function element(tag, content) {
        return '<' + tag + '>' + content + '</' + tag + '>'
    }

    function blockquote(src) {
        return src.replace(rx_blockquote, function (all, content) {
            return element('blockquote', blockquote(highlight(content.replace(/^ *&gt */gm, ''))))
        })
    }

    function list(src) {
        return src.replace(rx_list, function (all, ind, ol, num, low, content) {
            var entry = element('li', highlight(content.split(
                RegExp('\n ?' + ind + '(?:(?:\\d+|[a-zA-Z])[.)]|[*\\-+]) +', 'g')).map(list).join('</li><li>')))

            return '\n' + (ol
                ? '<ol start="' + (num
                    ? ol + '">'
                    : parseInt(ol, 36) - 9 + '" style="list-style-type:' + (low ? 'low' : 'upp') + 'er-alpha">') + entry + '</ol>'
                : element('ul', entry))
        })
    }

    function highlight(src) {
        return src.replace(rx_highlight, function (all, _, p1, emp, sub, sup, small, big, p2, content) {
            return _ + element(
                emp ? (p2 ? 'strong' : 'em')
                    : sub ? (p2 ? 's' : 'sub')
                        : sup ? 'sup'
                            : small ? 'small'
                                : big ? 'big'
                                    : 'code',
                highlight(content))
        })
    }

    function unesc(str) {
        return str.replace(rx_escape, '$1')
    }

    var stash = []
    var si = 0

    src = '\n' + src + '\n'

    replace(rx_lt, '&lt')
    replace(rx_gt, '&gt')
    replace(rx_space, '  ')

    // custom blogdata implementation
    replace(rx_blogdata, function (all, id, name) { return (+id === 0 ? (window.location.protocol === "file:" ? '<a class="bold" href="index.html">' : '<a href="/blog/">') : '<a href="blog-' + id + '.html">') + (name.slice(1) || blogTitles[id]) + '</a>' })
    replace(rx_button, function (all, id, name) { return '<button id="' + id + '">' + name + '</button>' })

    // blockquote
    src = blockquote(src)

    // horizontal rule
    replace(rx_hr, '<hr/>')

    // list
    src = list(src)
    replace(rx_listjoin, '')

    // code
    replace(rx_code, function (all, p1, p2, p3, p4) {
        stash[--si] = element('pre', element('code', p3 || p4.replace(/^    /gm, '')))
        return si + '\uf8ff'
    })

    // link or image
    replace(rx_link, function (all, p1, p2, p3, p4, p5, p6) {
        stash[--si] = p4
            ? p2
                ? '<img src="' + p4 + '" alt="' + p3 + '"/>'
                : '<a href="' + p4 + '">' + unesc(highlight(p3)) + '</a>'
            : p6
        return si + '\uf8ff'
    })

    // table
    replace(rx_table, function (all, table) {
        var sep = table.match(rx_thead)[1]
        return '\n' + element('table',
            table.replace(rx_row, function (row, ri) {
                return row == sep ? '' : element('tr', row.replace(rx_cell, function (all, cell, ci) {
                    return ci ? element(sep && !ri ? 'th' : 'td', unesc(highlight(cell || ''))) : ''
                }))
            })
        )
    })

    // heading
    replace(rx_heading, function (all, _, p1, p2) { return _ + element('h' + p1.length, unesc(highlight(p2))) })

    // paragraph
    replace(rx_para, function (all, content) { return element('p', unesc(highlight(content))) })

    // stash
    replace(rx_stash, function (all) { return stash[parseInt(all)] })

    return src.trim()
}

var html = markdown(blogText)
console.log("Generated HTML:\n" + html)
document.getElementById("content").innerHTML = html

function checkAge() {
    ageElement.textContent = "According to your computer, this blog is roughly " + (Date.now() / 60000 - 28956540).toLocaleString() + " minutes old."
}

var ageElement = document.getElementById("age")
if (ageElement !== null) {
    setInterval(checkAge, 60)
    checkAge()
}

function generateSuffix(num) {
    var mod10 = num % 10
    var mod100 = num % 100
    if (mod10 === 1 && mod100 !== 11) {
        return num + "st"
    } else if (mod10 === 2 && mod100 !== 12) {
        return num + "nd"
    } else if (mod10 === 3 && mod100 !== 13) {
        return num + "rd"
    }
    return num + "th"
}


var second = Math.floor((Date.now() % 60000) / 1000)
document.getElementsByTagName("sup")[0].textContent = ["thanks for viewing :)", "hope you enjoyed!", "bloggers! thanks for lookin' at my silly blog :)", "you opened this page on the " + generateSuffix(second) + " second."][Math.floor(Math.random() * 4)]