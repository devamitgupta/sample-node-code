$(document).ready(function () {
  $('.loader').show();

  $.get($('#url').val() + '?market=kse', function (data) {
    let productHtml = '';
    $('.loader').hide();

    let lang = $('#lang').val() === 'ar' ? 'ar' : 'en';

    if (data.length && data[3] !== undefined) {
      $.each(data[3].items, function (i, x) {
        productHtml += '<li target="payment"><div class="price-list-sub"><span>' + x.name + '</span><p>' + x.price + ' ' + x.currency + '</p>';
        // productHtml += '<div class="pricing-col"><h2>' + x.name + '</h2><p>' + x.description[lang] + '</p><h1><sup>$</sup>' + oneMonthPrice[0].price + '<sub>/mo</sub></h1><p>Order: ' + x.order + '</p><p>Version: ' + x.version + '</p><p>' + x.code + '</p></div>';
      });
      $('#pricesList').html(productHtml);
      // $('.pricing-inner').html(productHtml);
    }
  });
});