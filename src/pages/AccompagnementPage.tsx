import { useState } from 'react'

// Asset URLs from Figma
const imgLogo = "https://www.figma.com/api/mcp/asset/e6ad1698-d41c-43d7-ae63-55f27318b5d7"
const imgLogoText = "https://www.figma.com/api/mcp/asset/142820c1-121a-4d62-883d-1fc21e0de38d"
const imgBuilding = "https://www.figma.com/api/mcp/asset/27cbb506-424f-4722-a1c4-29d7aea37ccd"
const imgClose = "https://www.figma.com/api/mcp/asset/e61a38a1-179d-4c03-b6e4-ee00044b23c7"
const imgArrowLeft = "https://www.figma.com/api/mcp/asset/8229a2c0-9b28-4f9b-8f34-7f15e6f8a5ee"
const imgArrowRight = "https://www.figma.com/api/mcp/asset/5c2eb410-84ff-44d2-8f3f-48b1d0414c42"
const imgLock = "https://www.figma.com/api/mcp/asset/624e66b7-3d85-45e7-88f6-3a50a5fdf6a9"

type Step = 1 | 2

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.5 3.5L5.5 10.5L2.5 7.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="#404449" strokeWidth="1.5" />
      <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="#404449" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="16" r="1.5" fill="#404449" />
    </svg>
  )
}

function BuildingIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 21H21" stroke="#001d4a" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 21V5C5 3.89543 5.89543 3 7 3H13C14.1046 3 15 3.89543 15 5V21" stroke="#001d4a" strokeWidth="1.5" />
      <path d="M15 12H17C18.1046 12 19 12.8954 19 14V21" stroke="#001d4a" strokeWidth="1.5" />
      <path d="M8 7H8.01" stroke="#001d4a" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 7H12.01" stroke="#001d4a" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 11H8.01" stroke="#001d4a" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 11H12.01" stroke="#001d4a" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 15H8.01" stroke="#001d4a" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 15H12.01" stroke="#001d4a" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function Stepper({ currentStep }: { currentStep: Step }) {
  return (
    <div className="flex flex-1 gap-4 items-center p-[3px]">
      {/* Step 1 */}
      <div className={`flex flex-1 flex-col gap-0 items-start justify-center p-3 rounded-md ${currentStep === 1 ? 'bg-white' : ''}`}>
        <div className="flex flex-col gap-2 items-start w-full">
          <div className="flex gap-2 items-center min-h-5">
            {currentStep > 1 ? (
              <div className="flex items-center justify-center w-5 h-5 bg-[#00805d] rounded-full p-0.5">
                <CheckIcon />
              </div>
            ) : (
              <div className="flex items-center justify-center w-5 h-5 text-[#001d4a] text-xs font-semibold">
                1.
              </div>
            )}
            <span className="text-sm font-medium text-[#001d4a]">Votre entreprise</span>
          </div>
          <div className="w-full h-1 bg-[#ebecee] rounded-full overflow-hidden">
            <div className={`h-full bg-[#001d4a] rounded-full transition-all duration-500 ${currentStep >= 1 ? 'w-full' : 'w-0'}`} />
          </div>
        </div>
      </div>

      {/* Step 2 */}
      <div className={`flex flex-1 flex-col gap-0 items-start justify-center p-3 rounded-md ${currentStep === 2 ? '' : ''}`}>
        <div className="flex flex-col gap-2 items-start w-full">
          <div className="flex gap-2 items-center min-h-5">
            <div className="flex items-center justify-center w-5 h-5 text-[#001d4a] text-xs font-semibold">
              2.
            </div>
            <span className="text-sm font-medium text-[#001d4a]">Informations complémentaires</span>
          </div>
          <div className="w-full h-1 bg-[#ebecee] rounded-full overflow-hidden">
            <div className={`h-full bg-[#001d4a] rounded-r-full transition-all duration-500 ${currentStep >= 2 ? 'w-[87%]' : 'w-0'}`} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Header({ currentStep }: { currentStep: Step }) {
  return (
    <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center px-[60px] py-2 min-h-[80px]">
      <div className="flex items-center gap-16 w-full">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[28px] font-bold text-[#001d4a] tracking-tight" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>bpi</span>
          <span className="text-[28px] font-bold text-[#8B7226] tracking-tight" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>france</span>
          <span className="text-[#6f747b] mx-2">|</span>
          <span className="text-xs text-[#6f747b] uppercase tracking-wider font-medium">SERVIR L'AVENIR</span>
        </div>

        <Stepper currentStep={currentStep} />

        {/* Close button */}
        <button className="flex items-center justify-center w-10 h-10 bg-white rounded-full shrink-0 hover:bg-gray-50 transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4L4 12M4 4L12 12" stroke="#001d4a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </header>
  )
}

function BottomNav({ currentStep, onBack, onNext, nextLabel, nextDisabled }: {
  currentStep: Step
  onBack: () => void
  onNext: () => void
  nextLabel: string
  nextDisabled?: boolean
}) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center px-10 py-2 min-h-[80px] backdrop-blur-sm">
      <div className="flex items-center justify-between w-full">
        {currentStep > 1 ? (
          <button
            onClick={onBack}
            className="flex items-center gap-1 h-10 px-5 bg-white rounded-full hover:bg-gray-50 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 10H5M5 10L10 5M5 10L10 15" stroke="#001d4a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-base font-medium text-[#001d4a]">Retour</span>
          </button>
        ) : (
          <div />
        )}
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className="flex items-center gap-1 h-10 px-5 bg-[#ffcd00] rounded-full hover:bg-[#e6b800] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-base font-medium text-[#001d4a]">{nextLabel}</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 10H15M15 10L10 5M15 10L10 15" stroke="#001d4a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function Footer() {
  const links = [
    'Accessibilité : non/partiellement/totalement conforme',
    'Mentions légales',
    'CGU',
    'Protection des données',
    'Gestion des cookies',
    '© Bpifrance 2025',
  ]
  return (
    <div className="flex flex-wrap items-center justify-center gap-1 w-full mt-6">
      {links.map((link, i) => (
        <span key={i} className="text-sm text-[#6f747b] px-0.5 cursor-pointer hover:underline">
          {link}
        </span>
      ))}
    </div>
  )
}

function CompanyBadge() {
  return (
    <div className="flex items-center bg-white border border-[#f5f7f9] rounded-full p-1">
      <div className="flex items-center justify-center w-10 h-10 bg-[#fffbed] rounded-full">
        <BuildingIcon />
      </div>
      <div className="flex flex-col pl-2 pr-4 text-xs">
        <span className="text-[#181c24]" style={{ lineHeight: 1.4 }}>La Manufacture</span>
        <span className="text-[#50545a]" style={{ lineHeight: 1.4 }}>798 958 302</span>
      </div>
    </div>
  )
}

function Step1Content({ siren, onSirenChange }: { siren: string, onSirenChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-[222px] items-start w-full">
      {/* Left */}
      <div className="flex flex-1 items-center justify-center min-w-[327px] max-w-[371px] min-h-[634px] py-20 sticky top-0">
        <div className="flex flex-col gap-4 items-start w-full">
          <h1 className="text-[28px] font-medium text-[#001d4a] leading-[1.4]">
            Faites progresser votre entreprise
          </h1>
          <p className="text-base text-[#404449] leading-[1.5]">
            Pour identifier les offres auxquelles vous êtes éligible, nous avons besoin de quelques informations sur votre entreprise.
          </p>
          <div className="border-t border-[#d1d3d5] pt-4 w-full flex flex-col gap-2">
            <div className="flex gap-3 items-center">
              <LockIcon />
              <span className="text-base text-[#404449] leading-[1.5]">
                Nous vous demandons uniquement les informations essentielles.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex flex-1 flex-col items-center justify-center min-w-[327px] min-h-[634px] py-20">
        <div className="flex flex-col gap-6 items-start w-full">
          <div className="bg-white rounded-2xl p-6 w-full flex flex-col gap-6">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-base text-[#001d4a] flex items-center gap-1">
                Votre numéro de SIREN
                <span className="text-[#cf3339] text-sm">*</span>
              </label>
              <input
                type="text"
                value={siren}
                onChange={(e) => onSirenChange(e.target.value)}
                placeholder="ex: 443 061 841"
                className="w-full h-10 px-2 border-[1.5px] border-[#6f747b] rounded-md text-base text-[#001d4a] placeholder-[#50545a] focus:border-[#001d4a] focus:outline-none transition-colors"
              />
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  )
}

function Step2Content({
  email,
  onEmailChange,
  cguAccepted,
  onCguChange,
}: {
  email: string
  onEmailChange: (v: string) => void
  cguAccepted: boolean
  onCguChange: (v: boolean) => void
}) {
  return (
    <div className="flex flex-wrap gap-[222px] items-start w-full">
      {/* Left */}
      <div className="flex flex-1 items-center justify-center min-w-[327px] max-w-[371px] min-h-[634px] py-20 sticky top-0">
        <div className="flex flex-col gap-4 items-start w-full">
          <CompanyBadge />
          <h1 className="text-[28px] font-medium text-[#001d4a] leading-[1.4]">
            Dites-nous en plus sur vous
          </h1>
          <div className="border-t border-[#d1d3d5] pt-4 w-full flex flex-col gap-2">
            <div className="flex gap-3 items-center">
              <LockIcon />
              <span className="text-base text-[#404449] leading-[1.5]">
                Nous vous demandons uniquement les informations essentielles.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex flex-1 flex-col items-center justify-center min-w-[327px] min-h-[634px] py-20">
        <div className="flex flex-col gap-6 items-start w-full">
          <div className="bg-white rounded-2xl p-6 w-full flex flex-col gap-6">
            {/* Email input */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-base text-[#001d4a] flex items-center gap-1">
                Votre adresse e-mail
                <span className="text-[#cf3339] text-sm">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="exemple@bpifrance.fr"
                className="w-full h-10 px-2 border-[1.5px] border-[#6f747b] rounded-md text-base text-[#001d4a] placeholder-[#50545a] focus:border-[#001d4a] focus:outline-none transition-colors"
              />
            </div>

            {/* CGU Checkbox */}
            <div className="flex gap-2 items-start">
              <div className="relative shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={cguAccepted}
                  onChange={(e) => onCguChange(e.target.checked)}
                  className="sr-only peer"
                  id="cgu-checkbox"
                />
                <label
                  htmlFor="cgu-checkbox"
                  className="flex items-center justify-center w-5 h-5 border-[1.5px] border-[#001d4a] rounded cursor-pointer peer-checked:bg-[#001d4a] peer-checked:border-[#001d4a] transition-colors"
                >
                  {cguAccepted && <CheckIcon />}
                </label>
              </div>
              <label htmlFor="cgu-checkbox" className="text-base text-[#001d4a] leading-[1.5] cursor-pointer">
                J'accepte les{' '}
                <span className="underline cursor-pointer">Conditions Générales d'Utilisation</span>
                {' '}et j'atteste avoir pris connaissance des{' '}
                <span className="underline cursor-pointer">mentions d'information relatives au traitement des données à caractère personnel</span>
                {' '}présentées en article 9 des CGU.
                <span className="text-[#cf3339]">*</span>
              </label>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  )
}

export default function AccompagnementPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [siren, setSiren] = useState('')
  const [email, setEmail] = useState('')
  const [cguAccepted, setCguAccepted] = useState(false)

  const handleNext = () => {
    if (currentStep === 1 && siren.trim()) {
      setCurrentStep(2)
    } else if (currentStep === 2 && email.trim() && cguAccepted) {
      // Submit
      alert('Formulaire soumis !')
    }
  }

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1)
    }
  }

  const isNextDisabled = currentStep === 1
    ? !siren.trim()
    : !email.trim() || !cguAccepted

  return (
    <div
      className="relative flex flex-col w-full h-screen overflow-hidden"
      style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
    >
      {/* Header */}
      <Header currentStep={currentStep} />

      {/* Main content */}
      <div className="flex-1 bg-[#f5f7f9] overflow-auto">
        <div className="flex flex-col items-center justify-center px-[60px] pt-10 pb-[120px]">
          {currentStep === 1 && (
            <Step1Content siren={siren} onSirenChange={setSiren} />
          )}
          {currentStep === 2 && (
            <Step2Content
              email={email}
              onEmailChange={setEmail}
              cguAccepted={cguAccepted}
              onCguChange={setCguAccepted}
            />
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <BottomNav
        currentStep={currentStep}
        onBack={handleBack}
        onNext={handleNext}
        nextLabel={currentStep === 1 ? 'Suivant' : 'Je teste mon éligibilité'}
        nextDisabled={isNextDisabled}
      />
    </div>
  )
}
