import {
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useId,
  useState,
  type FC,
  type ReactElement,
  type ReactNode,
} from 'react'

const AccordionContext = createContext<{
  currentOpenItems: string[]
  toggleOpenItem: (id: string) => void
  registerItem: (id: string) => void
  unregisterItem: (id: string) => void
  items: string[]
} | null>(null)

const AccordionItemContext = createContext<{
  id: string
  isOpen: boolean
  index: number
} | null>(null)

export const Accordion: FC<{
  children: ReactNode
  value?: string[]
  defaultValue?: string[]
  type?: 'single' | 'multiple'
  onChange?: (prev: string[], next: string[]) => void
}> = ({ children, value, defaultValue = [], type = 'single', onChange }) => {
  const [currentOpenItems, setCurrentOpenItems] =
    useState<string[]>(defaultValue)
  const [items, setItems] = useState<string[]>([])

  const openItems = value || currentOpenItems

  const toggleOpenItem = (id: string) => {
    let newOpenItems: string[]
    if (type === 'single') {
      newOpenItems = openItems.includes(id) ? [] : [id]
    } else {
      newOpenItems = openItems.includes(id)
        ? openItems.filter((item) => item !== id)
        : [...openItems, id]
    }
    if (value === undefined) {
      setCurrentOpenItems(newOpenItems)
    }
    onChange?.(openItems, newOpenItems)
  }

  const registerItem = (id: string) => {
    setItems((items) => (items.includes(id) ? items : [...items, id]))
  }

  const unregisterItem = (id: string) => {
    setItems((items) => items.filter((item) => item !== id))
  }

  return (
    <AccordionContext.Provider
      value={{
        currentOpenItems: openItems,
        toggleOpenItem,
        registerItem,
        unregisterItem,
        items,
      }}
    >
      <div className='flex flex-col gap-2'>{children}</div>
    </AccordionContext.Provider>
  )
}

const useAccordion = () => {
  const context = useContext(AccordionContext)
  if (!context) {
    throw new Error('useAccordion must be used within an AccordionProvider')
  }
  return context
}

export const AccordionItem: FC<{ children: ReactNode; id?: string }> = ({
  children,
  id: givenId = null,
}) => {
  const defaultId = useId()
  const id = givenId ?? defaultId
  const { currentOpenItems, registerItem, unregisterItem, items } =
    useAccordion()
  const isOpen = currentOpenItems.includes(id)
  const index = items.indexOf(id)

  useEffect(() => {
    registerItem(id)
    return () => unregisterItem(id)
  }, [id])

  return (
    <AccordionItemContext.Provider value={{ id, isOpen, index }}>
      <div data-index={index} className='flex flex-col'>
        {children}
      </div>
    </AccordionItemContext.Provider>
  )
}

const useAccordionItem = () => {
  const context = useContext(AccordionItemContext)
  if (!context) {
    throw new Error('useAccordionItem must be used within an AccordionItem')
  }
  return context
}

export const AccordionTrigger: FC<{
  children: ReactElement<{ onClick?: (e: unknown) => void } & unknown>
}> = ({ children }) => {
  const { toggleOpenItem } = useAccordion()
  const { id } = useAccordionItem()

  return cloneElement(children, {
    ...children.props,
    onClick: (e: unknown) => {
      toggleOpenItem(id)
      children.props.onClick?.(e)
    },
  })
}

export const AccordionContent: FC<{ children: ReactNode; id?: string }> = ({
  children,
}) => {
  const { isOpen } = useAccordionItem()
  return <div className={isOpen ? 'block' : 'hidden'}>{children}</div>
}

export const AccordionExample = () => {
  return (
    <>
      <h1>Accordion</h1>
      <Accordion type='multiple'>
        <AccordionItem>
          <AccordionTrigger>
            <button>Trigger 1</button>
          </AccordionTrigger>
          <AccordionContent>
            <p>Content 1</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem>
          <AccordionTrigger>
            <button>Trigger 2</button>
          </AccordionTrigger>
          <AccordionContent>
            <p>Content 2</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem>
          <AccordionTrigger>
            <button>Trigger 3</button>
          </AccordionTrigger>
          <AccordionContent>
            <p>Content 3</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  )
}
