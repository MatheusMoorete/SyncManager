/**
 * ATENÇÃO: ESTE ARQUIVO CONTÉM APENAS DADOS MOCKADOS PARA DESENVOLVIMENTO
 * ========================================================================
 * O conteúdo deste arquivo não será incluído na build de produção devido
 * às verificações de ambiente e ao processo de tree-shaking durante a build.
 *
 * Este arquivo NÃO deve ser importado diretamente nos componentes, apenas
 * através das funções loadMockData() em utils.ts que verificam o ambiente.
 */

import { Customer } from '@/types/customer'
import { Service } from '@/types/service'
import { Appointment } from '@/types/schedule'
import { isDevelopment } from './utils'

// Função para verificar se estamos em produção sem mocks habilitados
const isProduction = () =>
  process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_USE_MOCKS !== 'true'

// Verificação se estamos em um ambiente do navegador (runtime) vs servidor/build
const isRuntimeEnvironment = typeof window !== 'undefined'

// Se estamos em produção E em runtime (não durante o build), emite um aviso no console
if (isProduction() && isRuntimeEnvironment) {
  console.warn(
    'O arquivo mock-data.ts foi importado em ambiente de produção. Isto não deveria acontecer.'
  )
}

/**
 * Coleção de dados mockados para desenvolvimento
 */

// Clientes mockados
export const mockCustomers: Customer[] = isDevelopment()
  ? [
      {
        id: 'mock-customer-1',
        full_name: 'Ana Silva',
        phone: '(11) 99999-1111',
        email: 'ana.silva@exemplo.com',
        birth_date: '1990-05-15',
        notes: 'Cliente VIP, prefere atendimento no período da tarde',
        createdAt: { toDate: () => new Date('2023-01-10') } as any,
        updatedAt: { toDate: () => new Date('2023-07-20') } as any,
        points: 120,
        active: true,
        ownerId: 'mock-owner-id',
      },
      {
        id: 'mock-customer-2',
        full_name: 'Carlos Oliveira',
        phone: '(11) 99999-2222',
        email: 'carlos@exemplo.com',
        birth_date: '1985-10-22',
        notes: 'Prefere ser atendido aos sábados',
        createdAt: { toDate: () => new Date('2023-02-05') } as any,
        updatedAt: { toDate: () => new Date('2023-05-15') } as any,
        points: 75,
        active: true,
        ownerId: 'mock-owner-id',
      },
      {
        id: 'mock-customer-3',
        full_name: 'Mariana Souza',
        phone: '(11) 99999-3333',
        email: 'mariana@exemplo.com',
        birth_date: '1995-03-30',
        notes: null,
        createdAt: { toDate: () => new Date('2023-03-15') } as any,
        updatedAt: { toDate: () => new Date('2023-06-10') } as any,
        points: 30,
        active: true,
        ownerId: 'mock-owner-id',
      },
      {
        id: 'mock-customer-4',
        full_name: 'Juliana Mendes',
        phone: '(11) 99999-4444',
        email: 'juliana@exemplo.com',
        birth_date: '1988-07-12',
        notes: 'Prefere atendimento no início da manhã',
        createdAt: { toDate: () => new Date('2023-01-15') } as any,
        updatedAt: { toDate: () => new Date('2023-06-22') } as any,
        points: 90,
        active: true,
        ownerId: 'mock-owner-id',
      },
      {
        id: 'mock-customer-5',
        full_name: 'Roberto Almeida',
        phone: '(11) 99999-5555',
        email: 'roberto@exemplo.com',
        birth_date: '1975-03-21',
        notes: 'Cliente pontual, sempre chega 10 minutos antes',
        createdAt: { toDate: () => new Date('2023-02-18') } as any,
        updatedAt: { toDate: () => new Date('2023-05-30') } as any,
        points: 45,
        active: true,
        ownerId: 'mock-owner-id',
      },
      {
        id: 'mock-customer-6',
        full_name: 'Camila Santos',
        phone: '(11) 99999-6666',
        email: 'camila@exemplo.com',
        birth_date: '1992-11-05',
        notes: 'Alérgica a alguns produtos, verificar ficha',
        createdAt: { toDate: () => new Date('2023-03-10') } as any,
        updatedAt: { toDate: () => new Date('2023-07-01') } as any,
        points: 60,
        active: true,
        ownerId: 'mock-owner-id',
      },
      {
        id: 'mock-customer-7',
        full_name: 'Ricardo Ferreira',
        phone: '(11) 99999-7777',
        email: 'ricardo@exemplo.com',
        birth_date: '1980-09-18',
        notes: 'Prefere ser atendido sempre pelo mesmo profissional',
        createdAt: { toDate: () => new Date('2023-01-25') } as any,
        updatedAt: { toDate: () => new Date('2023-06-15') } as any,
        points: 110,
        active: true,
        ownerId: 'mock-owner-id',
      },
      {
        id: 'mock-customer-8',
        full_name: 'Fernanda Lima',
        phone: '(11) 99999-8888',
        email: 'fernanda@exemplo.com',
        birth_date: '1993-04-27',
        notes: 'Sempre agenda para quintas-feiras',
        createdAt: { toDate: () => new Date('2023-02-12') } as any,
        updatedAt: { toDate: () => new Date('2023-07-05') } as any,
        points: 40,
        active: true,
        ownerId: 'mock-owner-id',
      },
      {
        id: 'mock-customer-9',
        full_name: 'Bruno Costa',
        phone: '(11) 99999-9999',
        email: 'bruno@exemplo.com',
        birth_date: '1979-12-03',
        notes: 'Cliente indicado pela Juliana Mendes',
        createdAt: { toDate: () => new Date('2023-03-05') } as any,
        updatedAt: { toDate: () => new Date('2023-06-28') } as any,
        points: 25,
        active: true,
        ownerId: 'mock-owner-id',
      },
      {
        id: 'mock-customer-10',
        full_name: 'Patrícia Oliveira',
        phone: '(11) 98888-1111',
        email: 'patricia@exemplo.com',
        birth_date: '1991-08-15',
        notes: 'Trabalha na região, prefere horário de almoço',
        createdAt: { toDate: () => new Date('2023-02-08') } as any,
        updatedAt: { toDate: () => new Date('2023-07-10') } as any,
        points: 85,
        active: true,
        ownerId: 'mock-owner-id',
      },
      {
        id: 'mock-customer-11',
        full_name: 'Leonardo Martins',
        phone: '(11) 98888-2222',
        email: 'leonardo@exemplo.com',
        birth_date: '1983-05-22',
        notes: 'Prefere ser contatado por WhatsApp',
        createdAt: { toDate: () => new Date('2023-01-30') } as any,
        updatedAt: { toDate: () => new Date('2023-06-25') } as any,
        points: 55,
        active: true,
        ownerId: 'mock-owner-id',
      },
      {
        id: 'mock-customer-12',
        full_name: 'Amanda Rodrigues',
        phone: '(11) 98888-3333',
        email: 'amanda@exemplo.com',
        birth_date: '1989-02-14',
        notes: 'Gosta de conversar bastante durante o atendimento',
        createdAt: { toDate: () => new Date('2023-03-18') } as any,
        updatedAt: { toDate: () => new Date('2023-07-12') } as any,
        points: 70,
        active: true,
        ownerId: 'mock-owner-id',
      },
      {
        id: 'mock-customer-13',
        full_name: 'Gustavo Pereira',
        phone: '(11) 98888-4444',
        email: 'gustavo@exemplo.com',
        birth_date: '1976-06-30',
        notes: 'Tem dificuldade com escadas, agendar sala térrea',
        createdAt: { toDate: () => new Date('2023-02-22') } as any,
        updatedAt: { toDate: () => new Date('2023-05-18') } as any,
        points: 100,
        active: true,
        ownerId: 'mock-owner-id',
      },
      {
        id: 'mock-customer-14',
        full_name: 'Bianca Alves',
        phone: '(11) 98888-5555',
        email: 'bianca@exemplo.com',
        birth_date: '1995-09-08',
        notes: 'Cliente nova, veio por indicação da Amanda',
        createdAt: { toDate: () => new Date('2023-04-05') } as any,
        updatedAt: { toDate: () => new Date('2023-07-03') } as any,
        points: 15,
        active: true,
        ownerId: 'mock-owner-id',
      },
      {
        id: 'mock-customer-15',
        full_name: 'Henrique Santos',
        phone: '(11) 98888-6666',
        email: 'henrique@exemplo.com',
        birth_date: '1987-11-17',
        notes: 'Sempre traz a namorada junto',
        createdAt: { toDate: () => new Date('2023-01-20') } as any,
        updatedAt: { toDate: () => new Date('2023-06-30') } as any,
        points: 65,
        active: true,
        ownerId: 'mock-owner-id',
      },
      {
        id: 'mock-customer-16',
        full_name: 'Carolina Mendonça',
        phone: '(11) 98888-7777',
        email: 'carolina@exemplo.com',
        birth_date: '1994-07-26',
        notes: 'Cliente do plano fidelidade premium',
        createdAt: { toDate: () => new Date('2023-02-28') } as any,
        updatedAt: { toDate: () => new Date('2023-07-15') } as any,
        points: 150,
        active: true,
        ownerId: 'mock-owner-id',
      },
      {
        id: 'mock-customer-17',
        full_name: 'André Gomes',
        phone: '(11) 98888-8888',
        email: 'andre@exemplo.com',
        birth_date: '1981-03-09',
        notes: 'Prefere pagamento por PIX',
        createdAt: { toDate: () => new Date('2023-03-25') } as any,
        updatedAt: { toDate: () => new Date('2023-06-12') } as any,
        points: 30,
        active: true,
        ownerId: 'mock-owner-id',
      },
      {
        id: 'mock-customer-18',
        full_name: 'Débora Vieira',
        phone: '(11) 98888-9999',
        email: 'debora@exemplo.com',
        birth_date: '1990-12-12',
        notes: 'Sempre chega atrasada, considerar no agendamento',
        createdAt: { toDate: () => new Date('2023-01-05') } as any,
        updatedAt: { toDate: () => new Date('2023-06-08') } as any,
        points: 45,
        active: true,
        ownerId: 'mock-owner-id',
      },
      {
        id: 'mock-customer-19',
        full_name: 'Lucas Teixeira',
        phone: '(11) 97777-1111',
        email: 'lucas@exemplo.com',
        birth_date: '1982-08-05',
        notes: 'Sempre vem acompanhado da esposa',
        createdAt: { toDate: () => new Date('2023-02-15') } as any,
        updatedAt: { toDate: () => new Date('2023-07-18') } as any,
        points: 80,
        active: true,
        ownerId: 'mock-owner-id',
      },
      {
        id: 'mock-customer-20',
        full_name: 'Tatiana Cardoso',
        phone: '(11) 97777-2222',
        email: 'tatiana@exemplo.com',
        birth_date: '1993-01-28',
        notes: 'Pede sempre o mesmo serviço',
        createdAt: { toDate: () => new Date('2023-03-30') } as any,
        updatedAt: { toDate: () => new Date('2023-06-20') } as any,
        points: 55,
        active: true,
        ownerId: 'mock-owner-id',
      },
      {
        id: 'mock-customer-21',
        full_name: 'Marcos Antônio',
        phone: '(11) 97777-3333',
        email: 'marcos@exemplo.com',
        birth_date: '1978-04-14',
        notes: 'Cliente desde a inauguração do salão',
        createdAt: { toDate: () => new Date('2023-01-08') } as any,
        updatedAt: { toDate: () => new Date('2023-05-25') } as any,
        points: 200,
        active: true,
        ownerId: 'mock-owner-id',
      },
      {
        id: 'mock-customer-22',
        full_name: 'Luiza Fernandes',
        phone: '(11) 97777-4444',
        email: 'luiza@exemplo.com',
        birth_date: '1997-06-19',
        notes: 'Estudante, pede descontos especiais',
        createdAt: { toDate: () => new Date('2023-04-10') } as any,
        updatedAt: { toDate: () => new Date('2023-07-08') } as any,
        points: 25,
        active: true,
        ownerId: 'mock-owner-id',
      },
      {
        id: 'mock-customer-23',
        full_name: 'Gabriel Moreira',
        phone: '(11) 97777-5555',
        email: 'gabriel@exemplo.com',
        birth_date: '1984-10-31',
        notes: 'Alérgico a alguns produtos, verificar na ficha',
        createdAt: { toDate: () => new Date('2023-02-20') } as any,
        updatedAt: { toDate: () => new Date('2023-06-05') } as any,
        points: 60,
        active: true,
        ownerId: 'mock-owner-id',
      },
    ]
  : []

// Serviços mockados
export const mockServices: Service[] = isDevelopment()
  ? [
      {
        id: 'mock-service-1',
        name: 'Design de Sobrancelhas',
        description: 'Modelagem completa com pinça e linha',
        price: 70,
        duration: 45,
        is_active: true,
        ownerId: 'mock-owner-id',
        public_booking: true,
        category: 'sobrancelhas',
      },
      {
        id: 'mock-service-2',
        name: 'Henna',
        description: 'Aplicação de henna para definição e coloração',
        price: 60,
        duration: 30,
        is_active: true,
        ownerId: 'mock-owner-id',
        public_booking: true,
        category: 'sobrancelhas',
      },
      {
        id: 'mock-service-3',
        name: 'Micropigmentação',
        description: 'Procedimento semipermanente para preenchimento de falhas',
        price: 350,
        duration: 120,
        is_active: true,
        ownerId: 'mock-owner-id',
        public_booking: true,
        category: 'sobrancelhas',
      },
      {
        id: 'mock-service-4',
        name: 'Limpeza de Pele Profunda',
        description: 'Tratamento completo com extração de cravos e hidratação',
        price: 180,
        duration: 90,
        is_active: true,
        ownerId: 'mock-owner-id',
        public_booking: true,
        category: 'estetica',
      },
      {
        id: 'mock-service-5',
        name: 'Depilação de Buço',
        description: 'Depilação com cera quente',
        price: 30,
        duration: 15,
        is_active: true,
        ownerId: 'mock-owner-id',
        public_booking: true,
        category: 'depilacao',
      },
    ]
  : []

// Agendamentos mockados
export const mockAppointments: Appointment[] = isDevelopment()
  ? [
      {
        id: 'mock-appointment-1',
        client_id: 'mock-customer-1',
        service_id: 'mock-service-1',
        scheduled_time: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
        actual_duration: '00:45:00',
        final_price: 70,
        status: 'scheduled',
        notes: 'Cliente pediu para confirmar por WhatsApp na véspera',
        discount: null,
        createdAt: new Date().toISOString(),
        client: {
          full_name: 'Ana Silva',
          phone: '(11) 99999-1111',
        },
        service: {
          name: 'Design de Sobrancelhas',
          duration: 45,
          base_price: 70,
        },
      },
      {
        id: 'mock-appointment-2',
        client_id: 'mock-customer-2',
        service_id: 'mock-service-3',
        scheduled_time: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
        actual_duration: '02:00:00',
        final_price: 350,
        status: 'completed',
        notes: null,
        discount: 10,
        createdAt: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
        client: {
          full_name: 'Carlos Oliveira',
          phone: '(11) 99999-2222',
        },
        service: {
          name: 'Micropigmentação',
          duration: 120,
          base_price: 350,
        },
      },
      {
        id: 'mock-appointment-3',
        client_id: 'mock-customer-3',
        service_id: 'mock-service-2',
        scheduled_time: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
        actual_duration: '00:30:00',
        final_price: 60,
        status: 'scheduled',
        notes: 'Cliente nova, primeira vez',
        discount: null,
        createdAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
        client: {
          full_name: 'Mariana Souza',
          phone: '(11) 99999-3333',
        },
        service: {
          name: 'Henna',
          duration: 30,
          base_price: 60,
        },
      },
      {
        id: 'mock-appointment-4',
        client_id: 'mock-customer-4',
        service_id: 'mock-service-1',
        scheduled_time: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
        actual_duration: '00:45:00',
        final_price: 70,
        status: 'completed',
        notes: 'Cliente gostou muito do resultado',
        discount: null,
        createdAt: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
        client: {
          full_name: 'Juliana Mendes',
          phone: '(11) 99999-4444',
        },
        service: {
          name: 'Design de Sobrancelhas',
          duration: 45,
          base_price: 70,
        },
      },
      {
        id: 'mock-appointment-5',
        client_id: 'mock-customer-5',
        service_id: 'mock-service-4',
        scheduled_time: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
        actual_duration: '01:30:00',
        final_price: 180,
        status: 'scheduled',
        notes: 'Primeira vez que faz este procedimento',
        discount: null,
        createdAt: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
        client: {
          full_name: 'Roberto Almeida',
          phone: '(11) 99999-5555',
        },
        service: {
          name: 'Limpeza de Pele Profunda',
          duration: 90,
          base_price: 180,
        },
      },
      {
        id: 'mock-appointment-6',
        client_id: 'mock-customer-6',
        service_id: 'mock-service-5',
        scheduled_time: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
        actual_duration: '00:15:00',
        final_price: 30,
        status: 'completed',
        notes: null,
        discount: null,
        createdAt: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
        client: {
          full_name: 'Camila Santos',
          phone: '(11) 99999-6666',
        },
        service: {
          name: 'Depilação de Buço',
          duration: 15,
          base_price: 30,
        },
      },
      {
        id: 'mock-appointment-7',
        client_id: 'mock-customer-7',
        service_id: 'mock-service-2',
        scheduled_time: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
        actual_duration: '00:30:00',
        final_price: 60,
        status: 'scheduled',
        notes: 'Cliente solicitou cor mais escura',
        discount: null,
        createdAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
        client: {
          full_name: 'Ricardo Ferreira',
          phone: '(11) 99999-7777',
        },
        service: {
          name: 'Henna',
          duration: 30,
          base_price: 60,
        },
      },
      {
        id: 'mock-appointment-8',
        client_id: 'mock-customer-8',
        service_id: 'mock-service-3',
        scheduled_time: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString(),
        actual_duration: '02:00:00',
        final_price: 350,
        status: 'completed',
        notes: 'Fazer retoque em 30 dias',
        discount: 50,
        createdAt: new Date(new Date().setDate(new Date().getDate() - 25)).toISOString(),
        client: {
          full_name: 'Fernanda Lima',
          phone: '(11) 99999-8888',
        },
        service: {
          name: 'Micropigmentação',
          duration: 120,
          base_price: 350,
        },
      },
      {
        id: 'mock-appointment-9',
        client_id: 'mock-customer-9',
        service_id: 'mock-service-4',
        scheduled_time: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
        actual_duration: '01:30:00',
        final_price: 180,
        status: 'scheduled',
        notes: 'Indicado pela Juliana',
        discount: 20,
        createdAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
        client: {
          full_name: 'Bruno Costa',
          phone: '(11) 99999-9999',
        },
        service: {
          name: 'Limpeza de Pele Profunda',
          duration: 90,
          base_price: 180,
        },
      },
      {
        id: 'mock-appointment-10',
        client_id: 'mock-customer-10',
        service_id: 'mock-service-5',
        scheduled_time: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
        actual_duration: '00:15:00',
        final_price: 30,
        status: 'completed',
        notes: null,
        discount: null,
        createdAt: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString(),
        client: {
          full_name: 'Patrícia Oliveira',
          phone: '(11) 98888-1111',
        },
        service: {
          name: 'Depilação de Buço',
          duration: 15,
          base_price: 30,
        },
      },
      {
        id: 'mock-appointment-11',
        client_id: 'mock-customer-11',
        service_id: 'mock-service-1',
        scheduled_time: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
        actual_duration: '00:45:00',
        final_price: 70,
        status: 'canceled',
        notes: 'Cliente cancelou por problemas de saúde',
        discount: null,
        createdAt: new Date(new Date().setDate(new Date().getDate() - 8)).toISOString(),
        client: {
          full_name: 'Leonardo Martins',
          phone: '(11) 98888-2222',
        },
        service: {
          name: 'Design de Sobrancelhas',
          duration: 45,
          base_price: 70,
        },
      },
      {
        id: 'mock-appointment-12',
        client_id: 'mock-customer-12',
        service_id: 'mock-service-2',
        scheduled_time: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString(),
        actual_duration: '00:30:00',
        final_price: 60,
        status: 'scheduled',
        notes: 'Segunda vez que faz o procedimento',
        discount: 10,
        createdAt: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
        client: {
          full_name: 'Amanda Rodrigues',
          phone: '(11) 98888-3333',
        },
        service: {
          name: 'Henna',
          duration: 30,
          base_price: 60,
        },
      },
      {
        id: 'mock-appointment-13',
        client_id: 'mock-customer-13',
        service_id: 'mock-service-4',
        scheduled_time: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
        actual_duration: '01:30:00',
        final_price: 180,
        status: 'no_show',
        notes: 'Cliente não compareceu sem avisar',
        discount: null,
        createdAt: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
        client: {
          full_name: 'Gustavo Pereira',
          phone: '(11) 98888-4444',
        },
        service: {
          name: 'Limpeza de Pele Profunda',
          duration: 90,
          base_price: 180,
        },
      },
      {
        id: 'mock-appointment-14',
        client_id: 'mock-customer-14',
        service_id: 'mock-service-1',
        scheduled_time: new Date(new Date().setDate(new Date().getDate() + 4)).toISOString(),
        actual_duration: '00:45:00',
        final_price: 70,
        status: 'scheduled',
        notes: 'Primeira vez neste salão',
        discount: 15,
        createdAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
        client: {
          full_name: 'Bianca Alves',
          phone: '(11) 98888-5555',
        },
        service: {
          name: 'Design de Sobrancelhas',
          duration: 45,
          base_price: 70,
        },
      },
    ]
  : []

// Interface para Receitas
export interface Receipt {
  id: string
  description: string
  amount: number
  date: string
  paymentMethod: 'cash' | 'credit_card' | 'debit_card' | 'pix' | 'transfer'
  category: string
  client_id?: string
  appointment_id?: string
  notes?: string
  createdAt: string
  ownerId: string
}

// Receitas mockadas (8)
export const mockReceipts: Receipt[] = isDevelopment()
  ? [
      {
        id: 'mock-receipt-1',
        description: 'Pagamento Design de Sobrancelhas',
        amount: 70,
        date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
        paymentMethod: 'pix',
        category: 'services',
        client_id: 'mock-customer-1',
        appointment_id: 'mock-appointment-1',
        notes: null,
        createdAt: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
        ownerId: 'mock-owner-id',
      },
      {
        id: 'mock-receipt-2',
        description: 'Pagamento Micropigmentação',
        amount: 350,
        date: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
        paymentMethod: 'credit_card',
        category: 'services',
        client_id: 'mock-customer-2',
        appointment_id: 'mock-appointment-2',
        notes: 'Parcelado em 3x',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
        ownerId: 'mock-owner-id',
      },
      {
        id: 'mock-receipt-3',
        description: 'Venda de produtos',
        amount: 120,
        date: new Date(new Date().setDate(new Date().getDate() - 8)).toISOString(),
        paymentMethod: 'cash',
        category: 'products',
        client_id: 'mock-customer-3',
        notes: 'Kit home care para sobrancelhas',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 8)).toISOString(),
        ownerId: 'mock-owner-id',
      },
      {
        id: 'mock-receipt-4',
        description: 'Pagamento Design + Henna',
        amount: 130,
        date: new Date(new Date().setDate(new Date().getDate() - 12)).toISOString(),
        paymentMethod: 'debit_card',
        category: 'services',
        client_id: 'mock-customer-5',
        appointment_id: 'mock-appointment-4',
        notes: 'Combo com desconto',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 12)).toISOString(),
        ownerId: 'mock-owner-id',
      },
      {
        id: 'mock-receipt-5',
        description: 'Curso básico de design',
        amount: 450,
        date: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
        paymentMethod: 'pix',
        category: 'courses',
        client_id: 'mock-customer-8',
        notes: 'Curso introdutório',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
        ownerId: 'mock-owner-id',
      },
      {
        id: 'mock-receipt-6',
        description: 'Pagamento Depilação',
        amount: 30,
        date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
        paymentMethod: 'cash',
        category: 'services',
        client_id: 'mock-customer-6',
        appointment_id: 'mock-appointment-6',
        notes: null,
        createdAt: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
        ownerId: 'mock-owner-id',
      },
      {
        id: 'mock-receipt-7',
        description: 'Venda de produtos',
        amount: 85,
        date: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
        paymentMethod: 'credit_card',
        category: 'products',
        client_id: 'mock-customer-10',
        notes: 'Creme hidratante facial',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
        ownerId: 'mock-owner-id',
      },
      {
        id: 'mock-receipt-8',
        description: 'Pagamento Limpeza de Pele',
        amount: 160,
        date: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString(),
        paymentMethod: 'pix',
        category: 'services',
        client_id: 'mock-customer-8',
        appointment_id: 'mock-appointment-8',
        notes: 'Com desconto para cliente frequente',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString(),
        ownerId: 'mock-owner-id',
      },
    ]
  : []

// Interface para Despesas
export interface Expense {
  id: string
  description: string
  amount: number
  date: string
  paymentMethod: 'cash' | 'credit_card' | 'debit_card' | 'pix' | 'transfer'
  category: string
  notes?: string
  createdAt: string
  ownerId: string
  recurring?: boolean
  paid: boolean
}

// Despesas mockadas (5)
export const mockExpenses: Expense[] = isDevelopment()
  ? [
      {
        id: 'mock-expense-1',
        description: 'Aluguel do espaço',
        amount: 1500,
        date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
        paymentMethod: 'transfer',
        category: 'rent',
        notes: 'Referente ao mês atual',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
        ownerId: 'mock-owner-id',
        recurring: true,
        paid: true,
      },
      {
        id: 'mock-expense-2',
        description: 'Compra de produtos',
        amount: 450,
        date: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
        paymentMethod: 'credit_card',
        category: 'supplies',
        notes: 'Hennas e pincéis',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
        ownerId: 'mock-owner-id',
        recurring: false,
        paid: true,
      },
      {
        id: 'mock-expense-3',
        description: 'Conta de água',
        amount: 95,
        date: new Date(new Date().setDate(new Date().getDate() - 8)).toISOString(),
        paymentMethod: 'debit_card',
        category: 'utilities',
        notes: null,
        createdAt: new Date(new Date().setDate(new Date().getDate() - 8)).toISOString(),
        ownerId: 'mock-owner-id',
        recurring: true,
        paid: true,
      },
      {
        id: 'mock-expense-4',
        description: 'Conta de energia',
        amount: 180,
        date: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
        paymentMethod: 'pix',
        category: 'utilities',
        notes: null,
        createdAt: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
        ownerId: 'mock-owner-id',
        recurring: true,
        paid: true,
      },
      {
        id: 'mock-expense-5',
        description: 'Manutenção equipamentos',
        amount: 250,
        date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
        paymentMethod: 'cash',
        category: 'maintenance',
        notes: 'Reparo na cadeira de atendimento',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
        ownerId: 'mock-owner-id',
        recurring: false,
        paid: false,
      },
    ]
  : []

// Funções getter - retornam array vazio em produção
export function getMockCustomers(): Customer[] {
  if (isProduction()) {
    return []
  }
  return mockCustomers
}

export function getMockServices(): Service[] {
  if (isProduction()) {
    return []
  }
  return mockServices
}

export function getMockAppointments(): Appointment[] {
  if (isProduction()) {
    return []
  }
  return mockAppointments
}

export function getMockReceipts(): Receipt[] {
  if (isProduction()) {
    return []
  }
  return mockReceipts
}

export function getMockExpenses(): Expense[] {
  if (isProduction()) {
    return []
  }
  return mockExpenses
}
