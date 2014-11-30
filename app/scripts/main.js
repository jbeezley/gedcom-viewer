/* global gedcom, d3 */
$(function () {
  'use strict';

  /*
  function getName(d) {
    return d.first + ' ' + d.middle + ' ' + d.last;
  }
  */

  var selectedId = null,
      node;
  function getSvg() {
    var width = $('.graph-container').width(),
        height = Number($(window).height()) / 2;
    $('.graph-container *').remove();
    return d3.select('.graph-container')
      .append('svg')
        .attr('width', width)
        .attr('height', height);
  }

  function formatDate(d) {
    d = new Date(d);
    if (Number.isFinite(d.valueOf())) {
      return d.toLocaleDateString();
    } else {
      return '-';
    }
  }

  function color(d) {
    if (selectedId === null) {
      return 'white';
    }
    var b = false;
    d.people.children.forEach(function (d) {
      if (d.id === selectedId) {
        b = true;
      }
    });
    if (b) {
      return 'firebrick';
    }

    if (d.descendents.indexOf(selectedId) >= 0) {
      return 'firebrick';
    }
    return 'white';
  }

  function drawTree(root) {
    var svg = getSvg();
    var diagonal = d3.svg.diagonal()
      .projection(function (d) { return [d.x, d.y]; });
    var width = Number(svg.attr('width') - 50),
        height = Number(svg.attr('height') - 50);
    svg = svg.append('g')
      .attr('transform', 'translate(25,25)');
    var tree = d3.layout.tree()
      .size([width, height]);
    var nodes = tree.nodes(root);
    var links = tree.links(nodes);

    node = svg.selectAll('circle.node')
      .data(nodes, function (d) { return d.id; });
    node.enter()
      .append('circle')
        .attr('class', 'node')
        .attr('r', 8)
        .attr('cx', function (d) {
          return d.x;
        })
        .attr('cy', function (d) {
          return d.y;
        })
        .style('fill', color)
        .style('stroke', 'black')
        .style('stroke-width', '1pt');

    node.exit().remove();

    var link = svg.selectAll('path.link')
      .data(links, function (d) { return d.target.id; });
    link.enter().insert('path', 'circle')
      .attr('class', 'link')
      .attr('d', diagonal);
    link.exit().remove();
  }

  function walkTree(root, fn) {
    fn(root);
    root.children.forEach(function (c) {
      walkTree(c, fn);
    });
  }

  function makeTable(root) {
    var data = [];
    walkTree(root, function (d) {
      Array.prototype.push.apply(data, d.people.children);
    });
    var table = $('.people-table').DataTable({
      data: data.map(function (d) {
        return [
          d.id.slice(1),
          d.name.last,
          d.name.first,
          d.name.middle,
          d.sex,
          d.born ? formatDate(d.born.date) : '-',
          d.died ? formatDate(d.died.date) : '-'
        ];
      }),
      columns: [
        {'title': 'ID'},
        {'title': 'Last'},
        {'title': 'First'},
        {'title': 'Middle'},
        {'title': 'Sex'},
        {'title': 'Birth'},
        {'title': 'Death'}
      ]
    });

    var rowIdx;
    $('.people-table tbody')
    .on('click', 'td', function () {
      rowIdx = table.cell(this).index().row;
      $( table.rows().nodes() ).removeClass('selected');
      $( table.row(rowIdx).nodes() ).addClass('selected');
      selectedId = 'I' + table.row(rowIdx).data()[0];
      node.style('fill', color);
      // makeTree(table.row(rowIdx).data()[0]);
    });
  }

  $('.open-gedcom').change(function (evt) {
    var file, roots;
    evt = evt.originalEvent;
    if (evt.target.files.length) {
      file = evt.target.files[0];

      gedcom.parse(file, function (records, ignored, content) {
        /*
        data = gedcom.normalize(records);
        data.people.forEach(function (p) {
          p._children = p.children;
          delete p.children;
        });
        db = TAFFY(data.people);
        fdb = TAFFY(data.families);
        makeTable();
        */

        if (records) {
          roots = gedcom.tree(records);
        } else {
          roots = JSON.parse(content);
        }
        makeTable(roots[2]);
        drawTree(roots[2]);
      });
    }
  });

  $('.about-button').click(function () {
  });
  $('input[type=file]').bootstrapFileInput();
  //$('.people-table').DataTable();
});
