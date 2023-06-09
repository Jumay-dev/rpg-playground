import React, { FC } from 'react'
import { observer } from 'mobx-react-lite'
import { Button, Form, Input, Space, Typography } from 'antd'
import { useStores } from '../../shared/hooks/stores'
import { ModalData } from '../../app/stores/modals'

const { Title, Text } = Typography

export type InitiativeProps = any
export const Initiative: FC<ModalData<InitiativeProps>> = observer(({ onClose }) => {
  const {
    playground: { characters, initialInitiative, setInitiative, setStage }
  } = useStores()

  const [form] = Form.useForm()

  const handleFormSubmit = async (e: React.MouseEvent<HTMLElement>) => {
    const newInitiative = form.getFieldsValue()
    await form.validateFields()
    setInitiative(newInitiative)
    setStage('fight')
    onClose()
  }

  return (
    <Space direction="vertical">
      <Title level={3}>Определите инициативу</Title>
      <Form form={form} initialValues={initialInitiative}>
        {characters.map((character, index) => (
          <Form.Item name={character.id} rules={[{ required: true, message: 'Заполните инициативу' }]} key={index}>
            <Space>
              <Text strong>{character.name}</Text>
              <Input />
            </Space>
          </Form.Item>
        ))}
        <Form.Item>
          <Button type="primary" onClick={handleFormSubmit}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Space>
  )
})
