$(function () {

  $("#slider-5").slider({
    orientation: "horizontal",
    value: 13,
    max: 19,
    min: 13,
    classes: {
      "ui-slider": "highlight"
    },
    slide: function (event, ui) {
      $("#minval").val(ui.value);
      generateMap(ui.value);
    }
  });
  $("#minval").val($("#slider-5").slider("value"));
});