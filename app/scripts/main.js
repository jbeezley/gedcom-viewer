/* global gedcom */
$(function () {
  'use strict';

  function formatDate(d) {
    if (d && Number.isFinite(d.valueOf())) {
      return d.toLocaleDateString();
    } else {
      return '-';
    }
  }

  function makeTable(data) {

    $('.people-table').DataTable({
      data: data.people.map(function (d) {
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
  }

  $('.open-gedcom').change(function (evt) {
    var file;
    evt = evt.originalEvent;
    if (evt.target.files.length) {
      file = evt.target.files[0];

      gedcom.parse(file, function (records) {
        var data = gedcom.normalize(records);
        makeTable(data);
      });
    }
  });

  //$('.people-table').DataTable();
});
