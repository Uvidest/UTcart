Custom Ajax cart Installing 
1 - put UTcart.js to assets folder

In theme.liquid file  - At head

 <script src="{{ 'UTcart.js' | asset_url }}" defer="defer"></script>  - At Body    {% render 'UTcart' %} 

- Add to body in theme.liquid attribute: data-currencySymbol="{{ cart.currency.symbol }}"  3 - Copy settings from settings_schema.json and paste to config - settings_schema.json  3 - in header.liquid find cart icon and add onclick="openCart()" for parent container, replace <a> tag to <div>, remove href attribute, and add for span, id="cart_count" when use {{ cart.item_count }}




4 - in main-product.liquid find quantity selector, ( default <quantity-input class="quantity"> ), inside input use attribute :
id="product_quantity-{{ product.selected_or_first_available_variant.id }}"

5 - under </quantity-input> paste:
  <div class="out_in_stock">Selected product quantity out in stock!</div>

6 - find type="submit" button, replace ‘submit’ to ‘button’, add attributes:

 onclick="handleAddToCart(this)"
 data-inputid="{{ product.selected_or_first_available_variant.id }}"

7 - find input by name=«id», paste id="varId-{{ product.selected_or_first_available_variant.id }}»


Locales - 
 "layout": {
    "cart": {
      "title": "Your cart",
      "shipping_finish": "Congratulations!! you already have the",
      "shipping_finish_strong": "free shipping",
      "shipping_progress": "to have Free Shipping",
      "klarna_clearpay": "Pay in 3 installments WITHOUT interest with",
      "checkout": "Checkout",
      "checkoutTwo": "Add"
    },











Create new template, and select it for upsell product in shopify admin 

<script>
  window.location.href = '{{ product.metafields.custom.upsell_redirect }}'
</script>
{% section 'product-template' %}
{% comment %}
{% section 'product-info' %}
{% section 'product-testimonial' %}
{% endcomment %}

{% if product.metafields.content.highlight-color %}
<style type="text/css">
  .product-meta-description-block .product-meta__content .highlighted-text,
  .product-single__title {
    color: #{{ product.metafields.content.highlight-color }};
  }
  
  .product-meta-description-block .product-description ul .list-number {
    background-color: #{{ product.metafields.content.highlight-color }};
  }
  
  .product-meta-description-block.timeline #timeline .timelineCont.visible .text::before {
    background-color: #{{ product.metafields.content.highlight-color }};
  }
  
  .product-meta-description-block.timeline #timeline .timelineCont .text {
    border-left: 2px #{{ product.metafields.content.highlight-color }}40 solid;
  }
  
  .product-meta-description-block.timeline #timeline .timelineCont .text:before {
    border: 2px #{{ product.metafields.content.highlight-color }} solid;
  }
  
  .after-product-bullets ul li .check-mark,
  .product-meta-description-block .check-mark {
    fill: #{{ product.metafields.content.highlight-color }};
  }
</style>
{% endif %}

{% comment %}
{{ product.metafields.content.section-1 }}
{{ product.metafields.content.section-2 }}
{{ product.metafields.content.section-3 }}
{{ product.metafields.content.section-4 }}
{% endcomment %}

  {{ product.metafields.content.product-meta-timeline }}

{{ product.metafields.content.product-meta-ingredients }}

{{ product.metafields.content.product-meta-ingredient-cards }}

{{ product.metafields.content.section-8 }}

{{ product.metafields.content.section-7 }}

{{ product.metafields.content.section-9 }}

{{ product.metafields.content.section-5 }}


{% if product.metafields.custom.description %}
{{ product.metafields.custom.description }}
{% endif %}


{% if product.metafields.product_faq != blank %}
<div class="product_faq-tabs page-width">
  <div class="collapsibles-wrapper collapsibles-wrapper--border-bottom">

    {% for i in (1..10) %}

    {% capture question %}question_{{ forloop.index }}{% endcapture %}
    {% capture answer %}answer_{{ forloop.index }}{% endcapture %}

    {%- if product.metafields.product_faq[question] and product.metafields.product_faq[answer] -%}
    <button type="button" class="label collapsible-trigger collapsible-trigger-btn collapsible-trigger-btn--borders collapsible--auto-height" aria-controls="faq--{{ forloop.index }}">
      <h2>{{ product.metafields.product_faq[question] }}</h2>
      {% include 'collapsible-icons' %}
    </button>
    <div id="faq--{{ forloop.index }}" class="collapsible-content collapsible-content--all">
      <div class="collapsible-content__inner rte">
        {{ product.metafields.product_faq[answer] }}
      </div>
    </div>
    {%- endif -%}

    {% endfor %}
  </div>
</div>
{% endif %}


{%- assign isBarCodeAvailable = false -%}
{%- assign isValidGtinLength = false -%}
{%- assign gtinString = "gtin" -%}
{%- assign daysProductPriceValidUntil = 90 | times: 86400 %}

{%- if product.selected_or_first_available_variant.barcode != blank -%}
{%- assign isBarCodeAvailable = true -%}
{%- assign gtinStringLength = product.selected_or_first_available_variant.barcode | size -%}
{%- if gtinStringLength == 8 or gtinStringLength == 12 or gtinStringLength == 13 or gtinStringLength == 14 -%}
{%- assign isValidGtinLength = true -%}
{%- assign gtinString = gtinString | append: gtinStringLength -%}
{%- endif -%}
{%- endif -%}

{%- assign variant = product.selected_or_first_available_variant -%}
{%- if variant %}
    {%- capture jsonLdOffers -%}
{
"@type": "Offer",
{%- if isBarCodeAvailable and isValidGtinLength %}
                "{{gtinString}}": "{{variant.barcode}}",
{%- elsif isBarCodeAvailable %}
                "mpn": "{{variant.barcode}}",
{%- endif %}
                "priceCurrency": "{{ shop.currency }}",
{%- assign decimalValue = variant.price | modulo: 100 %}{% if decimalValue < 10 %}{% assign decimalValue = decimalValue | prepend: "0" %}{% endif %}
                "price": "{{variant.price | divided_by: 100}}.{{decimalValue}}",
"priceValidUntil": "{{"now" | date: "%s" | plus: daysProductPriceValidUntil | date: "%Y-%m-%d"}}",
"availability": "http://schema.org/{% if variant.available %}InStock{% else %}OutOfStock{% endif %}",
"itemCondition": "http://schema.org/NewCondition",
{%- if variant.sku != blank %}
                "sku": "{{ variant.sku }}",
{%- endif -%}
{%- if variant.title != "Default Title" %}
                "name": "{{ variant.title | strip_newlines | strip_html | escape_once | replace: '\', '\\\\' }}",
{%- endif %}
                "url": "{{ shop.url | append: variant.url }}",
"seller": {
"@type": "Organization",
"name": "{{ shop.name | strip_newlines | strip_html | escape_once | replace: '\', '\\\\' }}"
}
}
{%- endcapture -%}
{%- endif -%}

{%- capture jsonLdBrand -%}
{
"@type": "Brand",
"name": "{{ product.vendor | strip_newlines | strip_html | escape_once | replace: '\', '\\\\' }}"
}
{%- endcapture -%}

<div id="reviews-widget-container">
  <div id="widget-container" class="data-ekomi-emp ekomi-widget-container ekomi-widget-sf14113861d6e3ffdc694"  ></div>

  <div id="ekomi-product-widget-identifier" class="prod-data-emp"  style="visibility: hidden">{{ product.id }}</div>

  <a href="https://www.ekomi.es/testimonios-naturadika.es.html" target="_blank"><img alt="naturadika.es Reviews with ekomi.es" src="https://smart-widget-assets.ekomiapps.de/resources/ekomi_logo.png" style="display: none;"/></a>

  <script type="text/javascript">
    function registerWidget (w, token) {
      w['_ekomiWidgetsServerUrl'] = 'https://widgets.ekomi.com';
      w['_customerId'] = 141138;
      if (w['_language'] == undefined) {
        w['_language'] = new Array();
      }
      w['_language'][token] = 'es';                    

      w['_schema_fields'] = [];
      //w['_schema_fields']['brand'] = '{{ product.vendor | strip_newlines | strip_html | escape_once | replace: '\', '\\\\' }}';
      w['_schema_fields']['brand'] = {{ jsonLdBrand | strip_newlines }};
      
      w['_schema_fields']['offers'] = [{{ jsonLdOffers | strip_newlines }}];

      w['_schema_fields']['description'] = '{{ product.metafields.custom.short_description | strip_newlines | strip_html | escape_once | replace: '\', '\\\\'}}';
      w['_schema_fields']['image'] = 'https:{{ product.featured_image.src | img_url: "master" }}';

      {%- if isBarCodeAvailable and isValidGtinLength %}
        w['_schema_fields']['{{ gtinString }}'] = '{{ product.selected_or_first_available_variant.barcode }}';
        w['_schema_fields']['productId'] = '{{ product.selected_or_first_available_variant.barcode }}';
      {%- elsif isBarCodeAvailable %}
      	w['_schema_fields']['mpn'] = '{{ product.selected_or_first_available_variant.barcode }}';
        w['_schema_fields']['productId'] = '{{ product.selected_or_first_available_variant.barcode }}';
        {%- endif %}

        {%- if product.selected_or_first_available_variant.sku != blank %}
      	w['_schema_fields']['sku'] = '{{ product.selected_or_first_available_variant.sku }}';
      {%- endif -%}

        if(typeof(w['_ekomiWidgetTokens']) !== 'undefined'){
          w['_ekomiWidgetTokens'][w['_ekomiWidgetTokens'].length] = token;
        } else {
          w['_ekomiWidgetTokens'] = new Array(token);
        }
      if(typeof(ekomiWidgetJs) == 'undefined') {
        ekomiWidgetJs = true;
        var scr = document.createElement('script');scr.src = 'https://sw-assets.ekomiapps.de/static_resources/widget.js';
        var head = document.getElementsByTagName('head')[0];head.appendChild(scr);

      }
      return true;
    }
    (function (w) {
      var token = 'sf14113861d6e3ffdc694';
      var k = document.getElementsByClassName("ekomi-widget-" + token);
      for(var x=0;x<k.length;x++){ registerWidget(w,token); }
    })(window);
  </script>
</div>
{% section 'product-recommendations' %}
{% section 'recently-viewed' %}

{% if collection %}
<div class="text-center page-content page-content--bottom">
  <a href="{% if collection.handle == 'frontpage' %}/{% else %}{{ collection.url }}{% endif %}" class="btn btn--small return-link">
    <svg aria-hidden="true" focusable="false" role="presentation" class="icon icon--wide icon-arrow-left" viewBox="0 0 50 15"><path d="M50 5.38v4.25H15V15L0 7.5 15 0v5.38z"/></svg> {{ 'products.general.collection_return' | t: collection: collection.title }}
  </a>
</div>
{% endif %}

<script>
  // Override default values of shop.strings for each template.
  // Alternate product templates can change values of
  // add to cart button, sold out, and unavailable states here.
  theme.productStrings = {
    addToCart: {{ 'products.product.add_to_cart' | t | json }},
    soldOut: {{ 'products.product.sold_out' | t | json }},
    unavailable: {{ 'products.product.unavailable' | t | json }}
  };
</script>



Creating upsell

1 -  Create this metafields:

2 - For main product, in metafields select upsell product
3 - In tag field create new tag, when first part - handle upsell product, second 
‘-main’



 

  





4 - For upsell product write upsell redirect url (if user try redirected to upsell product, redirect in this url), and upselling text (title upsell)

5 -on tag use handle first part, ‘-upsell’ - second 
