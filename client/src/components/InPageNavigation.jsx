import React, { useEffect, useRef, useState } from 'react'

export let activeTabLineRef
export let activeTabRef

const InPageNavigation = ({
  routes,
  hideOnLargeScreen = [],
  activeIndex = 0,
  children,
}) => {
  const [activeNavIndex, setActiveNavIndex] = useState(activeIndex)

  activeTabLineRef = useRef()
  activeTabRef = useRef()

  const handleTabChange = (btn, i) => {
    const { offsetWidth, offsetLeft } = btn

    activeTabLineRef.current.style.width = offsetWidth + 'px'
    activeTabLineRef.current.style.left = offsetLeft + 'px'

    setActiveNavIndex(i)
  }

  useEffect(() => {
    handleTabChange(activeTabRef.current, activeIndex)
  }, [])

  return (
    <>
      <div className="relative mb-8 bg-white border-b border-grey flex flex-nowrap overflow-x-auto">
        {routes.map((route, i) => (
          <button
            ref={i == activeIndex ? activeTabRef : null}
            key={i}
            className={`p-4 px-5 capitalize ${
              activeNavIndex == i ? 'text-black' : 'text-dark-grey'
            } ${hideOnLargeScreen.includes(route) && 'md:hidden'}`}
            onClick={(e) => handleTabChange(e.target, i)}
          >
            {route}
          </button>
        ))}
        <hr ref={activeTabLineRef} className="absolute bottom-0 duration-300" />
      </div>

      {Array.isArray(children) ? children[activeNavIndex] : children}
    </>
  )
}

export default InPageNavigation
