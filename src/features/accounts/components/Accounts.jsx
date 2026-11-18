import { useState } from 'react'
import { useParams } from 'react-router'
import {
  Button,
  Flex,
  Input,
  Pagination,
  Select,
  Table,
  Modal,
  Form,
  Card as AntCard,
  Row,
  Col,
  Space,
  Radio,
  Divider,
} from 'antd'

const { Item: FormItem } = Form
import {
  SearchOutlined,
  EditOutlined,
  LinkOutlined,
  UserOutlined,
  EyeOutlined,
} from '@ant-design/icons'

import './Accounts.scss'
import TextArea from 'antd/es/input/TextArea'

import { useShowMessage } from '../../../hooks/useShowMessage.js'
import {
  useAccountsQuery,
  useUpdateAccountMutation,
  useRolesQuery,
  useLazyIsAccountExistsQuery,
  useCreateAccountMutation,
  useAccCategoriesQuery,
  useUsersQuery,
} from '../services/apiSlice'

import { toTitleCase } from '../../../utils/toTitleCase.js'

function Accounts() {
  const [form] = Form.useForm()
  const [form2] = Form.useForm()

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [open, setOpen] = useState(false)
  const [isModalSubmitDisabled, setIsModalSubmitDisabled] = useState(false)
  const [updateAccount] = useUpdateAccountMutation()
  const { showMessage } = useShowMessage()
  const { id } = useParams()
  const [accountSearch, setAccountSearch] = useState()
  const [roleSearch, setRoleSearch] = useState()
  const [isEmailTaken, setIsEmailTaken] = useState(false)
  const [isNameTaken, setIsNameTaken] = useState(false)
  const [createAccountModalOpen, setCreateAccountModalOpen] = useState(false)
  const [selectedAccCateg, setSelectedAccCateg] = useState()
  const [userSearch, setUserSearch] = useState()
  const [accountViewModalOpen, setAccountViewModalOpen] = useState()
  const [account, setAccount] = useState()

  const isUserExisting = Form.useWatch('isUserExisting', form2)

  // const [checkUserExists, { isFetching: isCheckingEmail }] =
  //   useLazyIsUserExistsQuery()

  const [checkAccountExists] = useLazyIsAccountExistsQuery()
  const doesUserExist = (response) =>
    response?.data === true ||
    response?.exists === true ||
    response?.data?.exists === true

  const handleNameBlur = async () => {
    const name = String(form2.getFieldValue('name') ?? '').trim()
    if (!name) {
      setIsNameTaken(false)
      return
    }
    try {
      const response = await checkAccountExists({
        name,
        orgId: id,
      }).unwrap()
      if (doesUserExist(response)) {
        setIsNameTaken(true)
        form2.setFields([
          {
            name: 'name',
            errors: [`${name} already exists`],
          },
        ])
      } else {
        setIsNameTaken(false)
      }
    } catch (error) {
      if (doesUserExist(error?.data) || error?.status === 409) {
        setIsNameTaken(true)
        form2.setFields([
          {
            name: 'name',
            errors: [`${name} already exists`],
          },
        ])
        return
      }
      setIsNameTaken(false)
    }
  }
  const { data: accCategories } = useAccCategoriesQuery()
  const { data: users, isFetching: isUsersFetching } = useUsersQuery(
    { orgId: id, search: userSearch },
    { refetchOnMountOrArgChange: true }
  )
  const [createAccount] = useCreateAccountMutation()

  const handleEdit = (row) => {
    setOpen(true)
    form.setFieldsValue({
      id: row?.id,
      RolesIds: row?.Roles?.map((role) => role.id) ?? [],
    })
  }

  const handleView = (row) => {
    setAccountViewModalOpen(true)
    setAccount(row)
    console.log('account = ', row)
  }

  const TABLE_COLUMNS = [
    {
      title: 'Name',
      key: 'name',
      render: (_, row) => row.name,
    },
    {
      title: 'Handle',
      key: 'handle',
      render: (_, row) =>
        row?.User
          ? (row?.User?.handle ?? (
              <span style={{ color: '#999' }}>Handle not found</span>
            ))
          : '',
    },
    {
      title: 'Account Category',
      key: 'accountCategory',
      render: (_, row) =>
        row?.AccCateg ? `${toTitleCase(row?.AccCateg?.name)}` : '',
    },
    // {
    //   title: 'Roles',
    //   key: 'roles',
    //   render: (_, row) => {
    //     return row?.Roles?.length > 0
    //       ? row.Roles.map((role) => (
    //           <span
    //             key={role.name}
    //             style={{
    //               padding: '5px',
    //               border: '1px solid red',
    //               borderRadius: '5px',
    //               marginRight: '5px',
    //             }}
    //           >
    //             {toTitleCase(role.name)}
    //           </span>
    //         ))
    //       : ''
    //   },
    // },
    // {
    //   title: 'Is Active?',
    //   key: 'handle',
    //   render: (_, row) => row?.isActive ?
    //     <span
    //             key={row.id}
    //             style={{
    //               padding: '5px',
    //               border: '1px solid green',
    //               borderRadius: '5px',
    //               marginRight: '5px',
    //             }}
    //           >
    //             Yes
    //           </span>
    // : <span
    //             key={row.id}
    //             style={{
    //               padding: '5px',
    //               border: '1px solid red',
    //               borderRadius: '5px',
    //               marginRight: '5px',
    //             }}
    //           >
    //             No
    //           </span>,
    // },

    {
      title: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <>
          <Button
            type="link"
            onClick={() => handleEdit(row)}
            disabled={row?.User?.id}
          >
            <LinkOutlined
              style={{
                fontSize: '10px',
                marginRight: -10,
                marginBottom: -10,
                paddingRight: 0,
                textAlign: 'right',
              }}
            />
            <UserOutlined
              style={{
                fontSize: '15px',
                marginLeft: 0,
                paddingLeft: 0,
                textAlign: 'left',
              }}
            />
          </Button>
          <EyeOutlined onClick={() => handleView(row)} />
        </>
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

  const onFinishCreateAccountModal = async () => {
    try {
      // if (isEmailTaken ) {
      //   return
      // }
      if (isNameTaken) {
        return
      }
      setIsModalSubmitDisabled(true)
      const values = await form2.validateFields()

      const response = await createAccount({ accounts: [values], orgId: id })

      if (response?.data?.success === true) {
        form2.resetFields()
        setIsEmailTaken(false)
        setIsNameTaken(false)
        setCreateAccountModalOpen(false)
        showMessage({
          type: 'success',
          content: response?.data?.msg ?? 'Account created successfully!',
        })
      } else {
        showMessage({
          type: 'error',
          content: response?.error?.data?.message ?? 'Failed to create account',
        })
      }
    } catch (info) {
      console.log('Validate Failed:', info)
    } finally {
      setIsModalSubmitDisabled(false)
    }
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

  const handleCreateAccountModal = () => {
    form2.resetFields()
    setCreateAccountModalOpen(true)
  }

  const handleCreateAccountModalClose = () => {
    form2.resetFields()
    setCreateAccountModalOpen(false)
  }

  const onChange = (value) => {
    console.log(`change, ${value}`)
  }

  const onSearch = async (value, type) => {
    console.log('search:', value, type)
    try {
      if (type === 'debtor' || type === 'creditor') {
        setAccountSearch(value)
      } else if (type === 'user') {
        setUserSearch(value)
      }
    } catch (error) {
      console.log('Error searching:', error)
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
        <Flex
          gap="small"
          align="flex-start"
          justify="space-between"
          horizontal="true"
        >
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
          />{' '}
          <Divider vertical />
          <Button
            type="default"
            className="flex-button"
            style={{ width: '150px' }}
            onClick={handleCreateAccountModal}
          >
            Create Account
          </Button>
        </Flex>
        <div className="accounts-by-id__table-controls"></div>

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
          <Form form={form} layout="vertical" onFinish={onFinishModal}>
            <AntCard
              title={'Link to User'}
              // className={styles.CustomPanel}
            >
              <Row gutter={24}>
                <Col xs={24} xl={12} span={24} md={24} sm={24}>
                  <Form.Item name="id" hidden>
                    <Input type="hidden" />
                  </Form.Item>
                  <FormItem label="User:" name="UserId">
                    <Select
                      // mode="single"
                      allowClear
                      placeholder="Select User"
                      showSearch={{
                        onSearch: (value) => {
                          onSearch(value, 'user')
                        },
                        filterOption: false,
                      }}
                      disabled={isModalSubmitDisabled}
                      options={(users?.data ?? []).map((item) => ({
                        value: item.id,
                        label: `${item.name} ${item.handle ? `(${item.handle})` : ''}`,
                        searchText: `${item.name} ${item.handle ? `(${item.handle})` : ''}`,
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
          {/* <Form form={form} layout="vertical" onFinish={onFinishModal}>
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
          </Form> */}
        </div>
      </Modal>

      <Modal
        title=""
        open={accountViewModalOpen}
        width="50%"
        footer={null}
        closable={true}
        onCancel={() => setAccountViewModalOpen(false)}
      >
        <div>
          <Table
            columns={[
              {
                title: 'Account Name',
                dataIndex: 'name',
                key: 'name',
              },
              {
                title: 'Account Category',
                dataIndex: 'AccCategId',
                render: (_, row) => row?.AccCateg?.name ?? '',
              },
              {
                title: 'User Name',
                dataIndex: 'User.name',
                render: (_, row) => row?.User?.name ?? '',
              },
              {
                title: 'User Handle',
                dataIndex: 'User.handle',
                render: (_, row) =>
                  row?.User
                    ? (row?.User?.handle ?? (
                        <span style={{ color: '#999' }}>Handle not found</span>
                      ))
                    : '',
              },
            ]}
            dataSource={[account]}
            rowKey="id"
            pagination={false}
            size="middle"
            bordered
          />
          <div style={{ textAlign: 'center' }}>
            <Button
              // className={styles.inwardButton}
              onClick={() => setAccountViewModalOpen(false)}
              type="primary"
              ghost
              size="medium"
              style={{
                width: '60px',
              }}
            >
              Close
            </Button>
          </div>

          {/* <Form
            layout="vertical"
            key={account?.id}
            initialValues={{
              name: account?.User?.name ?? '',
              AccCategId: account?.AccCateg?.name ?? '',
              userName: account?.User?.name ?? '',
              userHandle: account?.User?.handle ?? '',
            }}
          >
            <AntCard
              title={'Account Details'}
              // className={styles.CustomPanel}
            >
              <Row gutter={24}>
                <Col xs={24} xl={12} span={24} md={24} sm={24}>
                  <FormItem label="Account Name:" name="name">
                    <Input disabled />
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col xs={24} xl={12} span={24} md={24} sm={24}>
                  <FormItem label="Account Category:" name="AccCategId">
                    <Input disabled />
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col xs={24} xl={12} span={24} md={24} sm={24}>
                  <FormItem label="User Name:" name="userName">
                    <Input disabled />
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col xs={24} xl={12} span={24} md={24} sm={24}>
                  <FormItem label="User Handle:" name="userHandle">
                    <Input disabled />
                  </FormItem>
                </Col>
              </Row>
            </AntCard>

            <FormItem className="text-center">
              <Space>
                <Button
                  // className={styles.inwardButton}
                  onClick={() => setAccountViewModalOpen(false)}
                  type="primary"
                  ghost
                  size="medium"
                >
                  Close
                </Button>
              </Space>
            </FormItem>
          </Form> */}
        </div>
      </Modal>
      <Modal
        title=""
        open={createAccountModalOpen}
        width="50%"
        footer={null}
        // className={styles.customModal}
        closable={false}
        onCancel={handleClose}
      >
        <div
        // className={`${styles.table_row}`}
        >
          <Form
            form={form2}
            layout="vertical"
            onFinish={onFinishCreateAccountModal}
          >
            <AntCard
              title={'Create Account'}
              // className={styles.CustomPanel}
            >
              <Row gutter={24}>
                <Col xs={24} xl={12} span={24} md={24} sm={24}>
                  <FormItem
                    label="Is the User existing / new:"
                    name="isUserExisting"
                    rules={[
                      {
                        required: true,
                        message: 'Select Existing / New',
                      },
                    ]}
                  >
                    <Radio.Group
                      onChange={(e) => {
                        if (e.target.value === true) {
                          form2.setFieldValue('AccCategId', undefined)
                        }
                      }}
                    >
                      <Radio value={true}>Existing</Radio>
                      <Radio value={false}>New</Radio>
                    </Radio.Group>
                  </FormItem>
                </Col>
                <Col xs={24} xl={12} span={24} md={24} sm={24}>
                  <FormItem
                    label="Account Category:"
                    name="AccCategId"
                    rules={[
                      {
                        required: true,
                        message: 'Select Account Category',
                      },
                    ]}
                  >
                    <Select
                      placeholder="Select Account Category"
                      showSearch
                      optionFilterProp="children"
                      onChange={(value) => {
                        const selectedCategory = accCategories?.data?.find(
                          (obj) => obj.id === value
                        )
                        const selectedName =
                          selectedCategory?.name?.toLowerCase()
                        setSelectedAccCateg(selectedName)
                      }}
                      options={
                        accCategories?.data?.map((item) => ({
                          value: item.id,
                          label: item.name,
                          disabled: isUserExisting
                            ? !['asset', 'liability'].includes(
                                item.name?.toLowerCase()
                              )
                            : false,
                        })) ?? []
                      }
                      disabled={isModalSubmitDisabled}
                    />
                  </FormItem>
                </Col>
                {isUserExisting && (
                  <Col xs={24} xl={12} span={24} md={24} sm={24}>
                    <FormItem
                      label="User:"
                      name="UserId"
                      rules={[
                        {
                          required: true,
                          message: 'Select User',
                        },
                      ]}
                    >
                      <Select
                        placeholder="Select User"
                        optionLabelProp="displayName"
                        showSearch={{
                          onSearch: (value) => onSearch(value, 'user'),
                          filterOption: false,
                        }}
                        loading={isUsersFetching}
                        notFoundContent={
                          isUsersFetching ? 'Searching...' : 'No users found'
                        }
                        onChange={(e) => onChange(e, 'user')}
                        disabled={isModalSubmitDisabled}
                        options={
                          users?.data?.map((item) => ({
                            value: item.id,
                            displayName: `${item.name} ${item.handle ? `(${item.handle})` : ''}`,
                            searchText: `${item.name} ${item.handle ?? ''}`,
                            label: (
                              <div className="accounts-by-id__user-option">
                                <div>{`${item.name}`}</div>
                                <div className="accounts-by-id__user-option-email">
                                  {item.handle}
                                </div>
                              </div>
                            ),
                          })) ?? []
                        }
                      />
                    </FormItem>
                  </Col>
                )}
                <Col xs={24} xl={12} span={24} md={24} sm={24}>
                  <FormItem
                    label="Account Name:"
                    name="name"
                    rules={[
                      {
                        required: true,
                        message: 'Enter Account Name',
                      },
                      {
                        validator: async () => {
                          if (isNameTaken) {
                            const name = String(
                              form2.getFieldValue('name') ?? ''
                            ).trim()
                            return Promise.reject(
                              new Error(`${name} already exists`)
                            )
                          }

                          return Promise.resolve()
                        },
                      },
                    ]}
                  >
                    <Input
                      placeholder="Enter Account Name"
                      onBlur={handleNameBlur}
                      onChange={() => {
                        if (isNameTaken) {
                          setIsNameTaken(false)
                        }
                      }}
                    />
                  </FormItem>
                </Col>

                {isUserExisting == false && selectedAccCateg == 'asset' && (
                  <Col xs={24} xl={12} span={24} md={24} sm={24}>
                    <FormItem label="Nature of Account:" name="natureOfAccount">
                      <Radio.Group>
                        <Radio value={'bank'}>Bank</Radio>
                        <Radio value={'cash'}>Cash</Radio>
                      </Radio.Group>
                    </FormItem>
                  </Col>
                )}
                {/* {isUserExisting == true &&
                  (selectedAccCateg == 'asset' ||
                    selectedAccCateg == 'liability') && (
                    <Col xs={24} xl={12} span={24} md={24} sm={24}>
                      <FormItem label="Roles:" name="RolesIds">
                        <Select
                          mode="multiple"
                          allowClear
                          placeholder="Select Role(s)"
                          showSearch
                          optionFilterProp="children"
                          onSearch={(e) => onSearch(e, 'roles')}
                          onChange={(e) => onChange(e, 'roles')}
                          disabled={isModalSubmitDisabled}
                          options={
                            roles?.data?.map((item) => ({
                              value: item.id,
                              label: item.name,
                            })) ?? []
                          }
                        />
                      </FormItem>
                    </Col>
                  )} */}
              </Row>
            </AntCard>

            <FormItem className="text-center">
              <Space>
                <Button
                  // className={styles.inwardButton}
                  htmlType="submit"
                  type="primary"
                  size="medium"
                  disabled={
                    isModalSubmitDisabled || isEmailTaken || isNameTaken
                  }
                >
                  Submit
                </Button>
                <Button
                  // className={styles.inwardButton}
                  onClick={handleCreateAccountModalClose}
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
