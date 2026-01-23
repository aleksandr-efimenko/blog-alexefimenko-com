const impactId = process.env.NEXT_PUBLIC_IMPACT_ID

export default function ImpactCom() {
    return (
        <p className='hidden'>Impact-Site-Verification: {impactId}</p>
    )
}