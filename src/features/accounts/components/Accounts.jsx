import { useMemo, useRef, useState, useEffect } from 'react'
import { useParams } from 'react-router'
import {
  Button,
  DatePicker,
  Flex,
  Input,
  InputNumber,
  Pagination,
  Select,
  Table,
  Typography,
  Modal,
  Form,
  Card as AntCard,
  Row,
  Col,
  Space,
  Radio,
  Upload,
} from 'antd'

const { Item: FormItem } = Form
import { SearchOutlined, EditOutlined } from '@ant-design/icons'

import dayjs from 'dayjs'
import './Accounts.scss'
import TextArea from 'antd/es/input/TextArea'

import { useShowMessage } from '../../../hooks/useShowMessage.js'
import {
  useAccountsQuery,
  useUpdateAccountMutation,
  useRolesQuery,
} from '../services/apiSlice'

import { toTitleCase } from '../../../utils/toTitleCase.js'

function Accounts() {
  const [form] = Form.useForm()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10);
  const [open, setOpen] = useState(false)
  const [isModalSubmitDisabled, setIsModalSubmitDisabled] = useState(false)
  const [updateAccount] = useUpdateAccountMutation()
  const { showMessage } = useShowMessage()
  const [initialValues, setInitialValues] = useState({})

  const { id } = useParams()
  const [accountSearch, setAccountSearch] = useState()
  const [roleSearch, setRoleSearch] = useState()
  
const handleEdit = (row) => {
  setOpen(true)
  form.setFieldsValue({
    id: row?.id,
    RolesIds: row?.Roles?.map((role) => role.id )
    // RolesIds: row?.Roles?.map((role) => { return { value: role.id, key: role.id, label: role.name } })
  })}

const TABLE_COLUMNS = [
  {
    title: 'Name',
    key: 'name',
    render: (_, row) => (row?.User ? `${row.User.name} (${row.User.uid})` : ''),
  },
  {
    title: 'Email',
    key: 'email',
    render: (_, row) => row?.User?.email || '',
  },
  {
    title: 'Account Type',
    key: 'accountType',
    render: (_, row) =>
      row?.AccTypeMaster ? `${toTitleCase(row?.AccTypeMaster?.name)}` : '',
  },
  {
    title: 'Roles',
    key: 'roles',
    render: (_, row) => {
      return row?.Roles?.length > 0
        ? row.Roles.map((role) => (
            <span
              key={role.name}
              style={{
                padding: '5px',
                border: '1px solid red',
                borderRadius: '5px',
                marginRight: '5px',
              }}
            >
              {toTitleCase(role.name)}
            </span>
          ))
        : ''
    },
  },

  {
    title: 'Actions',
    key: 'actions',
    render: (_, row) => (
      <Button type="link" onClick={() => handleEdit(row)}>
        <EditOutlined />
      </Button>
    ),
  },
]
  const handleClose = () => {
    form.resetFields()
    setOpen(false)
  }
  
  const handleSearch = (value) => {
    setRoleSearch(value)
  }
  
  const onFinishModal = async () => {
    try {
      setIsModalSubmitDisabled(true)
      const values = await form.validateFields()
      console.log('values = ', values)

      const response = await updateAccount({
        account: { ...values },
        orgId: id,
      })

      if (response?.data?.success === true) {
        form.resetFields()
        setOpen(false)
        showMessage({
          type: 'success',
          content: response?.data?.msg ?? 'Account updated successfully!',
        })
      } else {
        showMessage({
          type: 'error',
          content: response?.error?.data?.message ?? 'Failed to update account',
        })
      }
    } catch (info) {
      console.log('Validate Failed:', info)
    } finally {
      setIsModalSubmitDisabled(false)
    }
  }


  const { data: roles } = useRolesQuery({
    refetchOnMountOrArgChange: true,
    search: roleSearch,
  })

  const { data: accounts } = useAccountsQuery(
    // { count: 5 },
    // This option forces a refetch on component mount
    {
      refetchOnMountOrArgChange: true,
      orgId: id,
      search: accountSearch,
      page: currentPage,
      perPage: pageSize,
    }
  )
  const PAGE_SIZE_OPTIONS = [
    { value: 10, label: '10' },
    { value: 20, label: '20' },
    { value: 50, label: '50' },
  ]
  const journalTotal = Number(accounts?.pagination?.totalRecords) || 0

  return (
    <div className="accounts-by-id">
      <section className="accounts-by-id__panel accounts-by-id__table-panel">
        <div className="accounts-by-id__table-controls">
          <Input
            className="accounts-by-id__search"
            placeholder="Search"
            prefix={<SearchOutlined />}
            value={accountSearch}
            onChange={(event) => {
              setAccountSearch(event.target.value)
              setCurrentPage(1)
            }}
            allowClear
          />
        </div>

        <Table
          columns={TABLE_COLUMNS}
          dataSource={Array.isArray(accounts?.data) ? accounts.data : []}
          rowKey="id"
          pagination={false}
          size="middle"
          bordered
        />

        <div className="accounts-by-id__table-footer">
          <div className="accounts-by-id__pagination">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={journalTotal}
              showSizeChanger={false}
              showQuickJumper={false}
              onChange={(page) => setCurrentPage(page)}
            />
          </div>

          <div className="accounts-by-id__page-size">
            <Select
              value={pageSize}
              options={PAGE_SIZE_OPTIONS}
              onChange={(value) => {
                setPageSize(value)
                setCurrentPage(1)
              }}
              style={{ width: 72 }}
            />
          </div>
        </div>
      </section>

      <Modal
        title=""
        open={open}
        width="50%"
        footer={null}
        // className={styles.customModal}
        closable={true}
        onCancel={handleClose}
      >
        <div
        // className={`${styles.table_row}`}
        >
          <Form
            form={form}
            initialValues={initialValues}
            layout="vertical"
            onFinish={onFinishModal}
          >
            <AntCard
              title={'Update Account'}
              // className={styles.CustomPanel}
            >
              <Row gutter={24}>
                <Col xs={24} xl={12} span={24} md={24} sm={24}>
                  <Form.Item name="id" hidden>
                    <Input type="hidden" />
                  </Form.Item>
                  <FormItem label="Roles:" name="RolesIds">
                    <Select
                      mode="multiple"
                      allowClear
                      placeholder="Select Role(s)"
                      showSearch
                      optionFilterProp="children"
                      filterOption={false}
                      onSearch={handleSearch}
                      disabled={isModalSubmitDisabled}
                      options={(roles?.data ?? []).map((item) => ({
                        value: item.id,
                        label: item.name,
                      }))}
                    />
                  </FormItem>
                </Col>
              </Row>
            </AntCard>

            <FormItem className="text-center">
              <Space>
                <Button
                  // className={styles.inwardButton}
                  htmlType="submit"
                  type="primary"
                  size="medium"
                  disabled={isModalSubmitDisabled}
                >
                  Submit
                </Button>
                <Button
                  // className={styles.inwardButton}
                  onClick={handleClose}
                  type="primary"
                  ghost
                  size="medium"
                >
                  Close
                </Button>
              </Space>
            </FormItem>
          </Form>
        </div>
      </Modal>
    </div>
  )
}

export { Accounts }
