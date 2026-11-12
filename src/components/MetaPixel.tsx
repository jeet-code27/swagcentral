import Script from "next/script";
import { META_PIXEL_ID } from "@/lib/metaPixel";

/**
 * Meta Pixel base code for every page (ID {@link META_PIXEL_ID}).
 *
 * PageView is NOT sent from here: the Google Tag Manager container (GTM-K6WJFDK3) already sends
 * PageView for this pixel on every page load and page change, so sending it here too would count
 * every visit twice. If that GTM tag is ever removed, add after the init line:
 *   fbq('trackSingle', '<pixel id>', 'PageView');
 * The shopping events (ViewContent, AddToCart, InitiateCheckout, AddPaymentInfo, Purchase, Search)
 * are sent from the store code through trackPixel().
 */
export default function MetaPixel() {
  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');`}
      </Script>
      <noscript>
        {/* Visitors without JavaScript (GTM can't run for them) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
