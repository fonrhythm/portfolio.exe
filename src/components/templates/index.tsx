"use client";
import { Attachment, Card, LinkCard, PageHead, PhotoTape, Stamp, Todo, Tx, heroOf } from "../ui";
import { isTodo, useLang } from "@/lib/i18n";
import { useNav } from "@/lib/nav";
import { sitePath } from "@/lib/paths";
import type { L, Screen } from "@/lib/types";

type P = { screen: Screen; priority?: boolean };

const Bullets = ({ items }: { items?: L[] }) =>
  !items?.length ? null : (
    <ul className="mt-7 space-y-4 list-none p-0 m-0">
      {items.map((b, i) => (
        <li key={i} className="t-body flex gap-4">
          <span aria-hidden className="f-cap text-[12px] text-ink-soft pt-[0.55em] shrink-0 w-6">{String(i + 1).padStart(2, "0")}</span>
          <span><Tx v={b} /></span>
        </li>
      ))}
    </ul>
  );

const Section = ({ heading, children }: { heading: L; children: React.ReactNode }) => (
  <section className="mb-9">
    <h2 className="f-cap f-capb text-[13px] text-ink m-0 mb-5"><Tx v={heading} /></h2>
    {children}
  </section>
);

/* 档案卡 */
export function ProfileCard({ screen: s }: P) {
  const d = s.data;
  return (
    <div>
      <PageHead title={d.title} subtitle={d.subtitle} />
      {(d.period || d.role) && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 mb-7 m-0">
          {d.period && (<><dt className="f-cap text-[12px] text-ink-soft pt-1">Period</dt><dd className="m-0 t-body">{d.period.includes("待补位") ? <span className="todo-mark">待补位</span> : d.period}</dd></>)}
          {d.role && (<><dt className="f-cap text-[12px] text-ink-soft pt-1">Role</dt><dd className="m-0 t-body"><Tx v={d.role} /></dd></>)}
        </dl>
      )}
      {d.summary && <p className="t-body mb-7 mt-0"><Tx v={d.summary} /></p>}
      {d.metrics && <div className="grid grid-cols-2 gap-x-5 gap-y-8 my-8">{d.metrics.map((m, i) => <Stamp key={i} m={m} accent={i === 0} />)}</div>}
      <Bullets items={d.bullets} />
      {d.images && <div className="mt-8 grid gap-6">{d.images.slice(0, 2).map((im, i) => <PhotoTape key={im.src} img={im} n={i + 1} />)}</div>}
      {d.links && <div className="mt-8 grid gap-4">{d.links.map((l, i) => <LinkCard key={i} link={l} />)}</div>}
    </div>
  );
}

/* 时间轴 / 流程 */
export function Timeline({ screen: s }: P) {
  const d = s.data;
  return (
    <div>
      <PageHead title={d.title} subtitle={d.subtitle} />
      {d.period && <p className="f-cap text-[12px] text-ink-soft -mt-3 mb-6">{d.period}</p>}
      <ol className="list-none m-0 p-0 relative">
        <span aria-hidden className="absolute left-[15px] top-3 bottom-3 w-px bg-ink/40" />
        {d.steps?.map((st, i) => (
          <li key={i} className="relative pl-12 pb-7 last:pb-0">
            <span aria-hidden className="absolute left-0 top-0 w-[31px] h-[31px] bg-paper border border-ink f-didone text-[14px] flex items-center justify-center" style={{ color: "var(--tone)" }}>{i + 1}</span>
            <h2 className="f-cap f-capb text-[14px] leading-snug m-0 pt-1.5"><Tx v={st.title} /></h2>
            <p className="t-body text-ink-soft mt-2 mb-0"><Tx v={st.text} /></p>
          </li>
        ))}
      </ol>
      <Bullets items={d.bullets} />
    </div>
  );
}

/* 照片墙 */
export function PhotoWall({ screen: s, priority }: P) {
  const d = s.data;
  const imgs = d.images ?? [];
  const rest = heroOf(s) ? imgs.slice(1) : imgs;
  return (
    <div>
      <PageHead title={d.title} subtitle={d.subtitle} />
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 items-start">
        {rest.map((im, i) => (
          <div key={im.src} className={i % 3 === 0 ? "col-span-2" : ""}>
            <PhotoTape img={im} n={imgs.indexOf(im) + 1} priority={priority && i < 2} />
          </div>
        ))}
      </div>
      {d.links && <div className="mt-8 grid gap-4">{d.links.map((l, i) => <LinkCard key={i} link={l} />)}</div>}
    </div>
  );
}

/* 附件页 */
export function AttachmentPage({ screen: s }: P) {
  const d = s.data;
  return (
    <div>
      <PageHead title={d.title} subtitle={d.subtitle} />
      <div className="grid grid-cols-2 gap-x-4 gap-y-6">{d.attachments?.map((a, i) => <Attachment key={a.src} img={a} n={i + 1} />)}</div>
    </div>
  );
}

/* 数据板 */
export function StatsBoard({ screen: s }: P) {
  const d = s.data;
  let n = 0;
  return (
    <div>
      <PageHead title={d.title} subtitle={d.subtitle} />
      {d.sections?.map((sec, si) => (
        <Section key={si} heading={sec.heading}>
          <div className="grid grid-cols-2 gap-x-5 gap-y-8">
            {sec.metrics?.map((m, i) => <Stamp key={i} m={m} accent={n++ === 0} />)}
          </div>
        </Section>
      ))}
    </div>
  );
}

/* 外链卡页 */
export function LinksPage({ screen: s }: P) {
  const d = s.data;
  return (
    <div>
      <PageHead title={d.title} subtitle={d.subtitle} />
      {d.sections?.map((sec, si) => (
        <Section key={si} heading={sec.heading}><div className="grid gap-4">{sec.links?.map((l, i) => <LinkCard key={i} link={l} />)}</div></Section>
      ))}
    </div>
  );
}

/* 复盘（手账横线） */
export function CaseStudy({ screen: s }: P) {
  const d = s.data;
  return (
    <div>
      <PageHead title={d.title} subtitle={d.subtitle} />
      <div className="ruled">
        {d.sections?.map((sec, si) => (
          <section key={si} className="mb-8">
            <h2 className="f-cap f-capb text-[13px] leading-[32px] m-0"><Tx v={sec.heading} /></h2>
            {sec.items?.map((it, i) => <p key={i} className="t-body m-0 !leading-[32px]"><Tx v={it} /></p>)}
          </section>
        ))}
      </div>
    </div>
  );
}

/* 联系方式：索引卡 */
export function ContactCard({ screen: s }: P) {
  const d = s.data; const { lang } = useLang();
  return (
    <div>
      <PageHead title={d.title} subtitle={d.subtitle} />
      <div className="relative bg-paper-light border border-ink/40 px-5 pt-5 pb-9">
        <div aria-hidden className="absolute left-0 right-0 top-[52px] h-px" style={{ background: "var(--tone)" }} />
        <p className="f-cap text-[12px] text-ink-soft m-0 mb-6">{lang === "zh" ? "索引卡 · Contact" : "Index card · Contact"}</p>
        <dl className="m-0 ruled pt-2">
          {d.facts?.map((f, i) => (
            <div key={i}>
              <dt className="f-cap text-[12px] text-ink-soft leading-[32px]"><Tx v={f.label} /></dt>
              <dd className="m-0 f-serif text-[20px] leading-[32px]"><Tx v={f.value} /></dd>
            </div>
          ))}
        </dl>
        <div aria-hidden className="absolute left-1/2 -ml-2.5 bottom-2 w-5 h-5 rounded-full border border-ink/40 bg-paper" />
      </div>
    </div>
  );
}

/* 目录页：自动汇总本文件夹内容，新增作品自动出现 */
export function IndexPage({ screen: s }: P) {
  const d = s.data;
  const { screens, go } = useNav();
  const { lang } = useLang();
  const groups: { first: Screen; count: number }[] = [];
  for (const sc of screens) {
    if (sc.key === s.key) continue;
    const g = groups.find((x) => x.first.entryId === sc.entryId);
    if (g) g.count++; else groups.push({ first: sc, count: 1 });
  }
  return (
    <div>
      <PageHead title={d.title} subtitle={d.subtitle} />
      {d.summary && <p className="t-body mb-7 mt-0"><Tx v={d.summary} /></p>}
      <ol className="list-none m-0 p-0 border-t border-ink">
        {groups.map((g, i) => (
          <li key={g.first.entryId} className="border-b border-ink/30">
            <a href={sitePath(g.first.path)} onClick={(e) => { e.preventDefault(); go(g.first.path); }} className="flex items-baseline gap-4 min-h-[56px] py-4 text-ink no-underline">
              <span className="f-didone text-[18px] w-7" style={{ color: "var(--tone)" }}>{String(i + 1).padStart(2, "0")}</span>
              <span className="f-serif text-[19px] leading-snug flex-1"><Tx v={g.first.entryTitle ?? g.first.data.title} /></span>
              <span className="f-cap text-[12px] text-ink-soft whitespace-nowrap">{g.count > 1 ? `${g.count} ${lang === "zh" ? "页" : "pp"}` : "→"}</span>
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Body({ screen, priority }: P) {
  const p = { screen, priority };
  switch (screen.data.template) {
    case "index": return <IndexPage {...p} />;
    case "profile": return <ProfileCard {...p} />;
    case "timeline": return <Timeline {...p} />;
    case "photowall": return <PhotoWall {...p} />;
    case "attachment": return <AttachmentPage {...p} />;
    case "stats": return <StatsBoard {...p} />;
    case "links": return <LinksPage {...p} />;
    case "case-study": return <CaseStudy {...p} />;
    case "contact": return <ContactCard {...p} />;
    default: return <Todo />;
  }
}

export function PageRenderer({ screen, priority }: P) {
  return <Card screen={screen}><Body screen={screen} priority={priority} /></Card>;
}
