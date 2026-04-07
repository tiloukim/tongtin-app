'use client'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '2.5rem', maxWidth: 460, width: '100%', boxShadow: '0 4px 24px rgba(26,22,18,0.08)', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, background: 'var(--gold)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 20px' }}>💰</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>តុងទីន · Tong Tin</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 28 }}>ការគ្រប់គ្រងការសន្សំសហគមន៍ · Community Savings Pool</p>

        <div style={{ background: 'var(--gold-pale)', borderRadius: 12, padding: 16, marginBottom: 12, textAlign: 'left', fontSize: 13, lineHeight: 1.8, border: '1px solid var(--border)' }}>
          <strong style={{ color: 'var(--gold)' }}>⚠️ សេចក្ដីជូនដំណឹងសំខាន់:</strong><br />
          តុងទីន គឺជា<strong>ឧបករណ៍កត់ត្រាប៉ុណ្ណោះ</strong>។ គ្មានប្រាក់ឆ្លងកាត់វេទិការបស់យើងទេ។ យើងមិនទទួលខុសត្រូវចំពោះប្រតិបត្តិការហិរញ្ញវត្ថុ ជម្លោះ ឬការខាតបង់រវាងសមាជិកក្រុមឡើយ។
        </div>
        <div style={{ background: '#f5f5f0', borderRadius: 12, padding: 16, marginBottom: 24, textAlign: 'left', fontSize: 13, lineHeight: 1.7, border: '1px solid #e8e8e0' }}>
          <strong style={{ color: 'var(--gold)' }}>⚠️ Important Disclaimer:</strong><br />
          Tong Tin is a <strong>record-keeping tool only</strong>. No money passes through our platform. We are not responsible for any financial transactions, disputes, or losses between group members.
        </div>

        <div style={{ textAlign: 'left', marginBottom: 24, fontSize: 13, lineHeight: 1.7 }}>
          ដោយបន្ត អ្នកយល់ព្រមនឹង / By continuing, you agree to:
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li><Link href="/terms" style={{ color: 'var(--gold)', fontWeight: 600 }}>Terms / លក្ខខណ្ឌ</Link></li>
            <li><Link href="/privacy" style={{ color: 'var(--gold)', fontWeight: 600 }}>Privacy / ឯកជន</Link></li>
          </ul>
        </div>

        <button className="btn btn-gold" onClick={() => { window.location.href = '/app/login' }} style={{ fontSize: 16 }}>
          ខ្ញុំយល់ព្រម — បន្ត / I Agree — Continue
        </button>
      </div>
    </div>
  )
}
