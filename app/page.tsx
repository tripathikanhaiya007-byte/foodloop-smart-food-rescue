import { ArrowRight, Building2, CheckCircle2, HandHeart, Leaf, MapPin, PackageCheck, ShieldCheck, Sparkles, Truck, UtensilsCrossed } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { chatGPTSignInPath, chatGPTSignOutPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { ensureSeed } from "@/lib/foodloop-data";

export const dynamic = "force-dynamic";

const steps = [
  { icon: UtensilsCrossed, number: "01", title: "List safe surplus", text: "Hotels, restaurants and canteens publish quantity, pickup time, storage and allergen details." },
  { icon: HandHeart, number: "02", title: "Verified NGO accepts", text: "An approved food-rescue partner reserves the donation and receives a secure handover code." },
  { icon: Truck, number: "03", title: "Collect and deliver", text: "The pickup is tracked from acceptance to collection and community delivery." },
  { icon: Sparkles, number: "04", title: "Measure the impact", text: "Meals, food weight, people reached and avoided emissions are recorded automatically." },
];

export default async function Home() {
  await ensureSeed();
  const user = await getChatGPTUser();
  const signIn = chatGPTSignInPath("/dashboard");
  const signOut = chatGPTSignOutPath("/");

  return <main className="landing-page">
    <nav className="landing-nav">
      <Link className="landing-brand" href="/"><span><Leaf /></span><strong>FoodLoop<small>Smart food rescue</small></strong></Link>
      <div className="landing-links"><a href="#how">How it works</a><a href="#partners">For partners</a><a href="#safety">Trust & safety</a></div>
      <div className="landing-actions">
        {user ? <><span className="signed-in-as">Hi, {user.displayName.split(" ")[0]}</span><a className="ghost-link" href={signOut} target="_top">Sign out</a><a className="solid-link" href="/dashboard">Open dashboard <ArrowRight /></a></> : <><a className="ghost-link" href={signIn} target="_top">Sign in</a><a className="solid-link" href={signIn} target="_top">Join FoodLoop <ArrowRight /></a></>}
      </div>
    </nav>

    <section className="landing-hero">
      <div className="hero-copy">
        <span className="landing-kicker"><i /> Lucknow food rescue network</span>
        <h1>Good food deserves a <em>second destination.</em></h1>
        <p>FoodLoop connects hotels, restaurants and canteens with verified NGOs so safe surplus food reaches communities—not landfills.</p>
        <div className="hero-actions">
          <a className="hero-primary" href={user ? "/dashboard" : signIn} target={user ? undefined : "_top"}>{user ? "Go to dashboard" : "Create your account"}<ArrowRight /></a>
          <a className="hero-secondary" href="#how">See how it works</a>
        </div>
        <div className="trust-line"><span><CheckCircle2 /> No password stored</span><span><ShieldCheck /> Verified partners</span><span><PackageCheck /> Traceable handovers</span></div>
      </div>
      <div className="hero-media">
        <Image src="/foodloop-rescue-hero.png" width={1588} height={991} priority sizes="(max-width: 900px) 100vw, 48vw" alt="A restaurant team handing sealed surplus food containers to a food-rescue volunteer" />
        <div className="hero-float hero-float-top"><span><ShieldCheck /></span><div><strong>Food-safety details</strong><small>Recorded before every pickup</small></div></div>
        <div className="hero-float hero-float-bottom"><strong>356</strong><div><b>meals rescued</b><small>across recent demo deliveries</small></div></div>
      </div>
    </section>

    <section className="landing-proof"><div><strong>One network</strong><span>Donors, NGOs and administrators</span></div><div><strong>End-to-end</strong><span>List, reserve, collect and deliver</span></div><div><strong>Auditable</strong><span>Safety, status and impact records</span></div><div><strong>Local first</strong><span>Designed around Lucknow partners</span></div></section>

    <section id="how" className="landing-section how-section">
      <div className="landing-heading"><span>How FoodLoop works</span><h2>From surplus to support,<br/>without the chaos.</h2><p>Every step has a clear owner, deadline and status, making food rescue easier to coordinate and explain.</p></div>
      <div className="step-grid">{steps.map(({icon:Icon,number,title,text})=><article key={number}><div><span>{number}</span><Icon /></div><h3>{title}</h3><p>{text}</p></article>)}</div>
    </section>

    <section id="partners" className="partner-section">
      <div className="partner-story donor-story"><span className="story-icon"><Building2 /></span><span className="landing-kicker">FOR FOOD DONORS</span><h2>Turn daily surplus into measurable impact.</h2><p>Restaurants, hotels, event venues and campus kitchens can publish food in minutes and follow every verified handover.</p><ul><li><CheckCircle2 /> Food and allergen declaration</li><li><CheckCircle2 /> Pickup deadlines and status tracking</li><li><CheckCircle2 /> Download-ready impact history</li></ul></div>
      <div className="partner-story ngo-story"><span className="story-icon"><HandHeart /></span><span className="landing-kicker">FOR NGOs</span><h2>Find the right food, at the right time.</h2><p>Approved organisations can discover nearby donations, reserve a pickup and record delivery with one handover code.</p><ul><li><CheckCircle2 /> Searchable live inventory</li><li><CheckCircle2 /> Volunteer and ETA coordination</li><li><CheckCircle2 /> Collection and delivery verification</li></ul></div>
    </section>

    <section id="safety" className="safety-banner"><div className="safety-mark"><ShieldCheck /></div><div><span className="landing-kicker">TRUST IS BUILT INTO THE FLOW</span><h2>Accounts are verified before they can move food.</h2><p>New donors and NGOs submit organisation details. An administrator reviews them before donation or pickup tools are unlocked.</p></div><div className="safety-facts"><span><b>01</b>ChatGPT sign-in</span><span><b>02</b>Organisation review</span><span><b>03</b>Server-controlled role</span></div></section>

    <section className="landing-cta"><div><Leaf /><span>Start rescuing food responsibly</span></div><h2>Your next surplus meal can become someone&apos;s next meal.</h2><p>Create a donor or NGO account, complete verification and join the local rescue network.</p><a href={user ? "/dashboard" : signIn} target={user ? undefined : "_top"}>{user ? "Open FoodLoop" : "Join with ChatGPT"}<ArrowRight /></a></section>

    <footer className="landing-footer"><Link className="landing-brand" href="/"><span><Leaf /></span><strong>FoodLoop<small>Smart food rescue</small></strong></Link><p>Built as a social-impact technology project for safer, more traceable food redistribution.</p><span><MapPin /> Lucknow, India</span></footer>
  </main>;
}
