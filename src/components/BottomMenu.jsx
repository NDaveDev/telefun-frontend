import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAccount } from 'wagmi'

const BottomMenu = () => {
  let currentPath = window.location.pathname

  const { address } = useAccount()
  const [width, setWidth] = useState(window.innerWidth)
  function handleWindowSizeChange() {
    setWidth(window.innerWidth)
  }

  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange)
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange)
    }
  }, [])

  const isMobile = width <= 768

  return (
    <div>
      {isMobile ? (
        <div
          className="fixed bg-[#17134e] flex flex-col gap-[10px] px-[32px] w-full items-center overflow-hidden bottom-0"
          style={{
            transform: 'none',
            transformOrigin: '50% 50% 0px',
            zIndex: '100',
            height: '60px'
          }}
        >
          <div className="flex flex-row">
            <Link
              to="/CreateAgsys"
              className="left-bar-link"
              style={
                currentPath === '/CreateAgsys'
                  ? { background: '#00ee0030', borderRadius: '12px' }
                  : { background: 'transparent' }
              }
            >
              <span
                className={
                  currentPath === '/CreateAgsys'
                    ? 'text-[12px] uppercase text-[#e2fea5] menuButton'
                    : 'text-[12px] uppercase text-[#f8ffe8] hover:text-[#e2fea5] menuButton'
                }
              >
                <svg
                  viewBox="0 0 25 24"
                  focusable="false"
                  class="chakra-icon css-n059si"
                >
                  <path
                    d="M9.91543 7.90137L5.36942 8.25139L3.42676 10.194C4.64387 10.9172 5.81482 11.7152 6.93313 12.5835C10.0954 15.0591 12.7644 18.1069 14.801 21.5683L16.7437 19.6256L17.1032 15.0791"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></path>
                  <path
                    d="M6.65232 13.1469C7.62251 11.0357 8.88833 9.07335 10.4115 7.31886C10.4115 7.31886 15.4819 1.90846 20.8922 4.08425C23.068 9.35858 17.6576 14.565 17.6576 14.565C15.902 16.0841 13.9398 17.3458 11.8296 18.3137C11.1544 18.6743 10.4367 18.9492 9.69295 19.1304L5.80762 15.2451C6.0382 14.5262 6.32027 13.8249 6.65232 13.1469Z"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></path>
                  <path
                    d="M14.1983 12.2919C14.9922 12.2919 15.6358 11.6483 15.6358 10.8543C15.6358 10.0604 14.9922 9.41675 14.1983 9.41675C13.4043 9.41675 12.7607 10.0604 12.7607 10.8543C12.7607 11.6483 13.4043 12.2919 14.1983 12.2919Z"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></path>
                  <path
                    d="M16.9287 6.93994L20.4352 10.4367"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></path>
                </svg>
                <p>Deploy</p>
              </span>
            </Link>
            <Link
              to="/AllLaunches"
              className="left-bar-link"
              style={
                currentPath === '/' || currentPath === '/AllLaunches'
                  ? { background: '#00ee0030', borderRadius: '12px' }
                  : { background: 'transparent' }
              }
            >
              <span
                className={
                  currentPath === '/' || currentPath === '/AllLaunches'
                    ? 'text-[12px] uppercase text-[#e2fea5] menuButton'
                    : 'text-[12px] uppercase text-[#f8ffe8] hover:text-[#e2fea5] menuButton'
                }
              >
                <svg
                  viewBox="0 0 16 17"
                  focusable="false"
                  class="chakra-icon css-n059si"
                >
                  <path
                    d="M15.5891 15.0061L11.2364 10.6535C12.1865 9.40455 12.6267 7.84138 12.468 6.28022C12.3093 4.71905 11.5636 3.27644 10.3816 2.24425C9.19968 1.21206 7.66979 0.667351 6.10147 0.720328C4.53316 0.773306 3.04351 1.42001 1.93391 2.52961C0.824311 3.63921 0.177603 5.12886 0.124625 6.69718C0.0716477 8.26549 0.616356 9.79539 1.64855 10.9773C2.68074 12.1593 4.12335 12.905 5.68451 13.0637C7.24568 13.2224 8.80885 12.7822 10.0578 11.8321L14.4104 16.1848C14.5681 16.3386 14.7795 16.4246 14.9998 16.4246C15.22 16.4246 15.4315 16.3386 15.5891 16.1848C15.7453 16.0284 15.833 15.8165 15.833 15.5955C15.833 15.3745 15.7453 15.1625 15.5891 15.0061ZM1.83309 6.92679C1.83309 6.03678 2.09701 5.16675 2.59148 4.42673C3.08594 3.68671 3.78875 3.10993 4.61101 2.76933C5.43328 2.42874 6.33808 2.33963 7.211 2.51326C8.08391 2.68689 8.88573 3.11548 9.51507 3.74481C10.1444 4.37415 10.573 5.17597 10.7466 6.04889C10.9203 6.9218 10.8311 7.8266 10.4905 8.64887C10.15 9.47114 9.57318 10.1739 8.83316 10.6684C8.09313 11.1629 7.22311 11.4268 6.33309 11.4268C5.14005 11.4254 3.99628 10.9508 3.15267 10.1072C2.30906 9.26361 1.8345 8.11983 1.83309 6.92679Z"
                    fill="currentColor"
                  ></path>
                </svg>
                <p>Trade</p>
              </span>
            </Link>

            <Link
              to={'/profile/?address=' + address}
              className="left-bar-link"
              style={
                currentPath.includes('/profile')
                  ? { background: '#00ee0030', borderRadius: '12px' }
                  : { background: 'transparent' }
              }
            >
              <span
                className={
                  currentPath.includes('/profile')
                    ? 'text-[12px] uppercase text-[#e2fea5] menuButton'
                    : 'text-[12px] uppercase text-[#f8ffe8] hover:text-[#e2fea5] menuButton'
                }
              >
                <svg
                  viewBox="0 0 14 15"
                  focusable="false"
                  class="chakra-icon css-n059si"
                  aria-hidden="true"
                >
                  <path
                    d="M9.33301 7.29688H10.4997V9.63021H9.33301V7.29688Z"
                    fill="currentColor"
                  ></path>
                  <path
                    d="M11.667 4.38021V3.21354C11.667 2.57012 11.1437 2.04688 10.5003 2.04688H2.91699C1.95216 2.04688 1.16699 2.83204 1.16699 3.79688V10.7969C1.16699 12.0808 2.21349 12.5469 2.91699 12.5469H11.667C12.3104 12.5469 12.8337 12.0236 12.8337 11.3802V5.54688C12.8337 4.90346 12.3104 4.38021 11.667 4.38021ZM2.91699 3.21354H10.5003V4.38021H2.91699C2.7668 4.37349 2.62498 4.3091 2.52107 4.20044C2.41716 4.09177 2.35917 3.94722 2.35917 3.79688C2.35917 3.64653 2.41716 3.50198 2.52107 3.39331C2.62498 3.28465 2.7668 3.22026 2.91699 3.21354ZM11.667 11.3802H2.92399C2.65449 11.3732 2.33366 11.2665 2.33366 10.7969V5.43896C2.51683 5.50487 2.71108 5.54688 2.91699 5.54688H11.667V11.3802Z"
                    fill="currentColor"
                  ></path>
                </svg>
                <p>Portfolio</p>
              </span>
            </Link>
            <Link
              to={'/Trending'}
              className="left-bar-link"
              style={
                currentPath === '/Trending'
                  ? { background: '#00ee0030', borderRadius: '12px' }
                  : { background: 'transparent' }
              }
            >
              <span
                className={
                  currentPath === 'Trending'
                    ? 'text-[12px] uppercase text-[#e2fea5] menuButton'
                    : 'text-[12px] uppercase text-[#f8ffe8] hover:text-[#e2fea5] menuButton'
                }
              >
                <svg
                  viewBox="0 0 24 24"
                  focusable="false"
                  class="chakra-icon css-n059si"
                >
                  <path
                    d="M11.9964 14.6373V17.3345M8.01593 20.1071L8.90333 17.334H15.2396L16.127 20.1071M17.7441 20.107H6.39867M18.0497 3.89062H5.94922C5.94922 3.89062 5.95603 14.6366 12.0024 14.6366C18.0497 14.6366 18.0497 3.89062 18.0497 3.89062Z"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></path>
                  <path
                    d="M6.0541 5.65234H3.02315C3.02315 5.65234 2.59696 9.45101 5.40217 11.2978"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></path>
                  <path
                    d="M17.9453 5.65234H20.9763C20.9763 5.65234 21.4024 9.45101 18.5972 11.2978"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></path>
                </svg>
                <p>Trending</p>
              </span>
            </Link>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  )
}

export default BottomMenu
